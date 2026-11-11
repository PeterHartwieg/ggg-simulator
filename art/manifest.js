/* Your own artwork.

   The easy way needs no editing here: save a picture in this folder under the
   slot's name and the game picks it up. art/README.txt lists every slot, for
   example art/background.jpg, art/logo.png, art/c_breach.jpg, art/e_tencent.jpg.

   Use this file only if you want different file names, or to replace the small
   event icons. Example:

   window.GGG.artOverrides = {
     background: 'art/my-wallpaper.jpg',
     logo: 'art/my-logo.png',
     title: 'art/my-title.jpg',
     offices: ['art/garage.jpg', 'art/first-office.jpg'],   // by office, in order
     images: { c_breach: 'art/hands.jpg', e_tencent: 'art/deal.png' },
     icons: { orb: 'art/orb.png', kiwi: 'art/kiwi.png' }
   };

   Icon names: orb server reddit fire bug hammer money stage kiwi card building
   skull clock gear scroll mirror heart garage trophy cat totem banana

   You are responsible for having the right to use any image you add. */
window.GGG = window.GGG || {};
window.GGG.artOverrides = {};
