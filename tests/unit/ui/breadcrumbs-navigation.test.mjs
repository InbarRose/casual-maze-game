/**
 * Unit Test: Breadcrumbs Navigation in App Header and HUD (BL-54)
 * Verifies that top navigation renders rich breadcrumb hierarchies,
 * showing campaign chapters, storylines, and custom mode locations.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { initAppHeader } from '../../../js/ui/app-header.js';

describe('UI > Breadcrumb Navigation (BL-54)', () => {
  it('renders rich breadcrumb bar in universal app header when configured', () => {
    const breadcrumbs = [
      { label: 'Campaign', href: 'index.html#campaign', icon: '🗺️' },
      { label: 'Chapter 2: The Sunken Vaults', href: 'index.html#campaign-ch2' },
      { label: 'Level 5: Crypt of Whispers', active: true }
    ];

    const { header } = initAppHeader({
      activeTab: 'game',
      breadcrumbs
    });

    assert(header !== null, 'Header mounted');
    const html = header.innerHTML;
    assert(html.includes('app-breadcrumbs-bar'), 'Breadcrumbs bar exists in header HTML');
    assert(html.includes('Campaign'), 'Includes Campaign root');
    assert(html.includes('🗺️'), 'Includes root icon');
    assert(html.includes('Chapter 2: The Sunken Vaults'), 'Includes Chapter crumb');
    assert(html.includes('Level 5: Crypt of Whispers'), 'Includes active Level crumb');
    assert(html.includes('aria-current="page"'), 'Active crumb has aria-current="page"');
    assert(html.includes('crumb-separator'), 'Includes visual crumb separators');
  });

  it('omits breadcrumbs bar when breadcrumbs array is empty or not provided', () => {
    const { header } = initAppHeader({
      activeTab: 'hub',
      breadcrumbs: []
    });

    assert(header !== null, 'Header mounted');
    assert(!header.innerHTML.includes('app-breadcrumbs-bar'), 'No breadcrumbs bar rendered when empty');
  });

  it('handles custom storyline breadcrumbs correctly', () => {
    const { header } = initAppHeader({
      activeTab: 'game',
      breadcrumbs: [
        { label: 'Stories', href: 'index.html#stories', icon: '📜' },
        { label: 'The Novice\'s Initiation', href: 'index.html#story-novice' },
        { label: 'Chapter 3: The Hall of Mirrors', active: true }
      ]
    });

    assert(header !== null, 'Header mounted');
    const html = header.innerHTML;
    assert(html.includes('app-breadcrumbs-bar'), 'Breadcrumbs bar rendered for story');
    assert(html.includes('Stories'), 'Contains Stories label');
    assert(html.includes('The Novice\'s Initiation'), 'Contains story title');
    assert(html.includes('Chapter 3: The Hall of Mirrors'), 'Contains chapter title');
  });
});
