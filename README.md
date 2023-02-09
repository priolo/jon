![logo](./res/logo.png)  

## Installation

`npm install @priolo/jon`

## [Documentation](https://priolo.github.io/jon-doc/)


## [Examples](https://priolo.github.io/jon-doc/docs/examples)


## [Complete Project](https://github.com/priolo/jon-template)

---

## ROADMAP

- Documentation
- Involvement of the community
- Development of plugins to be applied to the library

## DEVELOPMENT NOTE

If you use a local hard-link in package.json for testing  
`npm link <path_app>/node_modules/react`  
to avoid the "Invalid hook call" error  
https://reactjs.org/warnings/invalid-hook-call-warning.html#duplicate-react

esempio:  
`npm link ||C:\Users\iorio\Documents\luca\zero\zero-os\web\||node_modules\react`

questa soluzione a quanto pare non funziona se usi VOLTA
in questo caso tocca cancellare, nel progetto JON, in `node_modules`
le cartelle:
- react
- react-dom