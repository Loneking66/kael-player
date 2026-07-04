# Kael Player

Kael Player is a React Native/Expo media player for M3U/M3U8 URLs added manually by the user.

> Legal notice: Kael Player is only a media player. The app does not provide playlists, channels, movies, series, streams, or any content. The user is responsible for the URLs and media sources they add.

## Status

Version target: `0.0.1` - initial functional MVP.

Current MVP capabilities:

- Load user-provided M3U/M3U8 URLs.
- Prefer Xtream Codes API when the user-provided URL exposes compatible credentials.
- List live channels, movies, and series.
- Filter each main section by API category, including `Todos` and `Sem categoria`.
- Search inside each section/category.
- Open series details, seasons, and episodes.
- Play selected media with basic native controls.
- Persist the last URL locally with AsyncStorage.
- Clear the locally saved URL.
- Show friendly errors for invalid URLs, loading failures, unsupported formats, and player failures.

## Technologies

- Expo SDK 51
- React Native
- TypeScript
- React Navigation
- Expo AV
- Expo FileSystem
- AsyncStorage

## Install

```bash
npm install
```

## Run

```bash
npx expo start --clear
```

On Windows PowerShell, this also works:

```powershell
npx.cmd expo start --clear
```

Then open the app with Expo Go or an Android/iOS emulator.

## Manual Test Checklist

- Add a user-owned M3U/M3U8 or compatible Xtream URL.
- Confirm the app loads without infinite loading.
- Open `Canais`, choose `Todos` and at least one category, then play an item.
- Open `Filmes`, choose `Todos` and at least one category, then play an item.
- Open `Series`, choose `Todos` and at least one category.
- Tap a series, confirm seasons and episodes load.
- Tap an episode and confirm it opens the player.
- Use search inside each section.
- Clear the saved URL in settings or home.

## Privacy and Compliance

- The project does not include real playlists, real stream URLs, channel logos, channel names, or protected media.
- The app does not collect user data in this MVP.
- The app does not store passwords separately or collect sensitive user data.
- The last URL is stored only on the local device.
- The app does not scrape websites.
- The app does not bypass DRM.
- Console logs mask URLs that may contain credentials.

## Project Structure

```text
src/
  components/
  constants/
  navigation/
  screens/
  services/
  storage/
  types/
  utils/
```

## Next Steps

- Replace temporary diagnostic logs with a proper debug flag.
- Improve player compatibility using a dedicated video package if needed.
- Add favorites and recent items.
- Add Android TV navigation support.
- Add automated tests for M3U parsing and Xtream mapping with fictitious data only.
- Prepare a production build and Play Store compliance review.
