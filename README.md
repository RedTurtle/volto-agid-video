# volto-agid-video

Video player AGID per Volto: è il porting React del web component
[`<it-video>` di dev-kit-italia](https://github.com/italia/dev-kit-italia/tree/main/packages/video).
Usa la stessa libreria ([video.js](https://videojs.com/) con il tech YouTube),
le stesse opzioni di default e lo stesso layout
(tema `vjs-theme-bootstrap-italia` di bootstrap-italia).

La gestione del consenso ai cookie **non** è quella di dev-kit-italia: resta
in carico a `ConditionalEmbed` di
[volto-gdpr-privacy](https://github.com/RedTurtle/volto-gdpr-privacy), come
già avveniva.

## Installazione

L'addon estende `design-comuni-plone-theme` e deve essere dichiarato **dopo**
il tema, perché sovrascrive alcune sue customizations:

```json
"addons": [
  "design-comuni-plone-theme",
  "@redturtle/volto-agid-video"
]
```

## Cosa sostituisce

L'addon customizza tutti i renderer video esistenti per usare il nuovo player:

| Addon | File | Note |
| --- | --- | --- |
| Volto | `components/manage/Blocks/Video/Body` | blocco Video (view) |
| design-comuni-plone-theme | `customizations/volto/components/manage/Blocks/Video/Body` | blocco Video (edit, importato in modo relativo da `Edit.jsx`) |
| design-comuni-plone-theme | `components/ItaliaTheme/Blocks/VideoGallery/Block/ViewBlock` | blocco Video gallery |
| design-comuni-plone-theme | `components/ItaliaTheme/View/Commons/EmbeddedVideo` | video nella Gallery dei CT |
| volto-wildcard-media | `components/View/VideoView/VideoView` | vista del CT WildcardVideo |
| volto-wildcard-media | `components/ModalPreview/ModalPreview` | modale del template "Media con modale" |

Le customizations di volto-wildcard-media sono attive solo nei progetti in cui
è installato.

Sorgenti supportate:

- **YouTube** (video, shorts, live, playlist): video.js con il tech YouTube
- **file video** caricati su Plone (scaricati con `@@download/file`) o esterni
  (`mp4`, `webm`, `ogg`, HLS `m3u8`, DASH `mpd`): video.js con il tech html5
- **Vimeo**: iframe, perché video.js non ha un tech Vimeo nativo
  (dev-kit-italia lo demanda a un plugin esterno, vedi `initPlugins`)

## Utilizzo

```jsx
import { AgidVideoPlayer } from '@redturtle/volto-agid-video';

<AgidVideoPlayer
  src="https://www.youtube.com/watch?v=..."
  poster="/immagine/@@images/image"
  title="Titolo del video"
  track={[
    { kind: 'captions', src: '/sottotitoli.vtt', srclang: 'it', label: 'Italiano', default: true },
  ]}
>
  {/* contenuto opzionale sotto al player, es. la trascrizione */}
</AgidVideoPlayer>
```

Per un url generico (YouTube, Vimeo, file interno o esterno) si può usare
`VideoEmbed` con `getVideoSource`, ricordando di avvolgerlo in
`ConditionalEmbed` per i video di terze parti:

```jsx
import { ConditionalEmbed } from 'volto-gdpr-privacy';
import { VideoEmbed, getVideoSource } from '@redturtle/volto-agid-video';

<ConditionalEmbed url={url}>
  <VideoEmbed source={getVideoSource(url)} title={title} />
</ConditionalEmbed>
```

### Props di `AgidVideoPlayer`

Corrispondono agli attributi di `<it-video>`:

| Prop | Descrizione |
| --- | --- |
| `src` | url del video |
| `type` | mime-type, default `video/mp4` (ignorato per YouTube) |
| `poster` | immagine di anteprima |
| `title` | titolo, usato per l'`aria-label` del player |
| `options` | [opzioni di video.js](https://videojs.com/guides/options/) |
| `language` | lingua del player, di default quella del sito |
| `translations` | traduzioni di video.js, `{ [lang]: { 'Play': '...' } }`, unite a quelle italiane preimpostate |
| `track` | sottotitoli, didascalie, capitoli, descrizioni (WebVTT) |
| `initPlugins` | funzione che riceve `videojs`, per registrare plugin aggiuntivi (equivale a `init-plugins`) |
| `lazy` | mostra solo l'immagine di anteprima e il pulsante play, e crea il player solo al click; di default attivo per YouTube |
| `children` | contenuto sotto al player (es. trascrizione, equivale allo slot) |

### Configurazione

Opzioni, traduzioni e plugin possono essere impostati per tutti i player in
`config.settings.agidVideo`:

```js
config.settings.agidVideo = {
  ...config.settings.agidVideo,
  options: { preload: 'metadata' },
  translations: { en: { Play: 'Play' } },
  initPlugins: (videojs) => {
    /* registra plugin/tech aggiuntivi */
  },
};
```

## Anteprima dei video di terze parti

Per YouTube e Vimeo viene mostrata solo l'immagine di anteprima con il
pulsante play (stesso aspetto del player): l'iframe viene messo in pagina solo
quando l'utente preme play, e il video parte subito. I file video sono invece
renderizzati direttamente con video.js, che mostra già il poster e non usa
iframe.

## Differenze rispetto a `<it-video>`

- nessun overlay di consenso: i cookie sono gestiti da `ConditionalEmbed`;
- `crossorigin="anonymous"` è impostato solo se ci sono tracce di sottotitoli,
  altrimenti impedirebbe la riproduzione di video esterni senza header CORS;
- i video Vimeo sono incorporati con un iframe.
