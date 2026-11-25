import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { isMediaImageFailed, MediaImage } from '../components/ui/MediaImage';

test('MediaImage renders img for valid local/https sources and fallback for unsafe/empty sources', () => {
  const validLocalMarkup = renderToStaticMarkup(
    React.createElement(MediaImage, {
      src: '/assets/sample.jpg',
      alt: 'Sample cover',
      fallbackTitle: 'Sample Title',
    })
  );
  assert.ok(validLocalMarkup.includes('<img '), 'Valid /assets/ image should render <img>');
  assert.ok(!validLocalMarkup.includes('Cover artwork unavailable'));

  const validDevImportMarkup = renderToStaticMarkup(
    React.createElement(MediaImage, {
      src: '/src/assets/images/sample_game_lantern_depths_1795358242269.jpg',
      alt: 'Lantern Depths cover',
      fallbackTitle: 'Lantern Depths',
    })
  );
  assert.ok(validDevImportMarkup.includes('<img '), 'Valid Vite dev asset path should render <img>');

  const validHttpsMarkup = renderToStaticMarkup(
    React.createElement(MediaImage, {
      src: 'https://img.itch.zone/a.png',
      alt: 'Itch CDN cover',
      fallbackTitle: 'Itch Cover',
    })
  );
  assert.ok(validHttpsMarkup.includes('<img '), 'Valid public HTTPS image should render <img>');
  assert.ok(validHttpsMarkup.includes('referrerPolicy="no-referrer"') || validHttpsMarkup.includes('referrerpolicy="no-referrer"'));

  const blockedSources = [
    'https://[::ffff:127.0.0.1]/x.png',
    '/assets/not-an-image.html',
    '/admin',
    null,
  ];

  for (const src of blockedSources) {
    const markup = renderToStaticMarkup(
      React.createElement(MediaImage, {
        src,
        alt: 'Blocked artwork',
        fallbackTitle: 'Fallback Game',
      })
    );
    assert.ok(!markup.includes('<img '), `Unsafe or empty source ${String(src)} must not render <img>`);
    assert.ok(markup.includes('role="img"'), `Unsafe or empty source ${String(src)} must render fallback role="img"`);
    assert.ok(markup.includes('Cover artwork unavailable'));
  }
});

test('NEW-03 regression: isMediaImageFailed resets immediately when src changes', () => {
  const urlA = 'https://example.com/broken.png';
  const urlB = '/assets/sample_game.jpg';

  // Initially no failure
  assert.equal(isMediaImageFailed(urlA, null), false);

  // After failure on URL A
  assert.equal(isMediaImageFailed(urlA, urlA), true);

  // Immediately false when src changes to URL B even before effects flush
  assert.equal(isMediaImageFailed(urlB, urlA), false);

  // Empty/null src never reports failed state
  assert.equal(isMediaImageFailed(null, urlA), false);
  assert.equal(isMediaImageFailed(undefined, urlA), false);
  assert.equal(isMediaImageFailed('', urlA), false);
});
