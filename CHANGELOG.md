# Changelog

## [1.0.0](https://github.com/manosliod/score-4/compare/v0.1.0...v1.0.0) (2026-10-16)


### ✨ Features

* add the Forest Material 3 components for React ([f26672a](https://github.com/manosliod/score-4/commit/f26672a00c7364d56d1b192846b62c5040bd8959))
* expose the game core to the web through embind ([139fe59](https://github.com/manosliod/score-4/commit/139fe59ab30ca268f4ac06d72ec478a736b41073))
* play Score 4 in the browser on the WebAssembly game core ([a17f642](https://github.com/manosliod/score-4/commit/a17f6422fc1c76dc8e7a720f1374755f609ed047))
* report the four cells of a winning line ([0f22900](https://github.com/manosliod/score-4/commit/0f229000872975bcee854f8ae01a5dc09c92733b))


### 🐛 Bug Fixes

* accept lowercase r and y as colours ([0380689](https://github.com/manosliod/score-4/commit/03806894d51a0acb891ecc0ec6b6f8a05fa97484))
* ask again after input that is not a number and stop at the end of input ([703d09a](https://github.com/manosliod/score-4/commit/703d09a0567087e3022ea5fe0feb067e5410162a))
* check every engine value with Zod and read only the column that changed ([5b1b1c1](https://github.com/manosliod/score-4/commit/5b1b1c15938b5e2c68e876309d88bbdd9b615549))
* clear the screen with an ANSI code instead of cls, only on a terminal ([e20952e](https://github.com/manosliod/score-4/commit/e20952ee18b81d42bb2b5ddbf82dbfc4a1b7b282))
* keep the release build free of the unused system() result warning ([3c9f479](https://github.com/manosliod/score-4/commit/3c9f47982e3527f4860325015a11115ed55d71b7))
* pass the first colour to the second prompt without unwrapping it ([69cf621](https://github.com/manosliod/score-4/commit/69cf6217692f9c0743f196e0b7d20a6c4e1b7bf1))
* pick the starter from the ages as they are once the engine has loaded ([8d30b29](https://github.com/manosliod/score-4/commit/8d30b2992cdd28153b2d100465742adb32c57c8f))
* refuse a coin in a full column and ask the same player again ([6a685e0](https://github.com/manosliod/score-4/commit/6a685e02ce9d76389855d6901ce6c60bf64c5388))
* refuse moves after a win or a tie in the game core ([9eaba31](https://github.com/manosliod/score-4/commit/9eaba311deabe1496706e8532332ef896061a96d))
* see four in a line on rising diagonals and in the top row ([aadfb99](https://github.com/manosliod/score-4/commit/aadfb9973173a75bddbda8baae6570b4f8c759ce))
* show the error screen when the game screen fails to download ([665530e](https://github.com/manosliod/score-4/commit/665530e8afef065909499d2b5f0bb666db462051))
* **web:** close the full-column snackbar once a move is accepted ([d66d679](https://github.com/manosliod/score-4/commit/d66d679efc68e389b3ca32ecc6beee7effe70c7e))


### ♻️ Refactoring

* ask for both colours with one prompt loop in the console ([3f7bd21](https://github.com/manosliod/score-4/commit/3f7bd210be109852c137cc5a61a43e32d927a39b))
* read ring and border widths and breakpoints from the design tokens ([68627cb](https://github.com/manosliod/score-4/commit/68627cbb55ecdcc245a835c9f21985ec72bdd2f9))
* remove descriptive comments, move the rules they held to docs/rules.md ([a21eedf](https://github.com/manosliod/score-4/commit/a21eedf268e3ff6bec38bd2e364386dbedde65cb))
* share the store context helper between the setup and game stores ([a051734](https://github.com/manosliod/score-4/commit/a051734c5852c3b690c96563a287ae8e6a16328c))
* split into a pure game core and a console front end ([140bc2c](https://github.com/manosliod/score-4/commit/140bc2ca5383e6c062e25274bcbd9c34644bc0e9))
* start each round from a shared empty board and drop unused engine bindings ([6a490df](https://github.com/manosliod/score-4/commit/6a490df9bbb7a2628fc840c1386071f25f9318ba))


### CI

* KAN-3 release with release-please and deploy on release ([#7](https://github.com/manosliod/score-4/issues/7)) ([b4938d0](https://github.com/manosliod/score-4/commit/b4938d00bbb9a0d613b91f0ca3c7d65af552ffc6))
