Complete template for REACT SPA (2021)

# INDEX
[Startup]
[Store]
[CRA]
[AJAX]
[I18N]
[MOCK]
[ROUTING]
[UI COMPONENTS]
[URL]
[AUTH]
[TECNOLOGY]
[github]
[codesandbox]

(in some cases MSW in sandbox does not work. Try open in new window)

# STARTUP
This TEMPLATE allows you to derive a project in a fast and clean way.  
You have full control of the code as it is a classic CRA.  
Many typical management problems are solved in the template  
and it can be a good way to learn.  

clone:
`git clone https://github.com/priolo/jon-template.git`
enter:
`cd jon-template`
install npm modules:
`npm install`
install MSW
`npx msw init public/ --save`
run:
`npm run start`

The template is based on a library for managing the STORE in REACT:
[Jon](https://github.com/priolo/jon)
and the concepts solved are:

## STORE
When you use REACT for medium-large projects the first urgency is:

**Separate the VIEW from the BUSINESS LOGIC**
There are libraries for this! The most famous is [REDUX](https://redux.js.org/)
But, in my opinion, it is too long-winded and cumbersome.
So I started using the native REACT methods [REDUCER](https://it.reactjs.org/docs/hooks-reference.html#usereducer) and [PROVIDERS](https://it.reactjs.org/docs/hooks-reference.html#usecontext)
Eventually I ended up with a VERY VERY light bookcase inspired by [VUEX](https://vuex.vuejs.org/)!
[Jon](https://github.com/priolo/jon)
Check it out!

## CRA
There isn't much to say! If you want to make an app in REACT it is better to use [CRA](https://create-react-app.dev/)
You just don't have to manage `babel` and `webpack`:
The APP will have a pre-established and reproducible setup.

## DIRECTORY
The structure in the file system of the TEMPLATE:

### components
it contains everything that is not a PAGE or DIALOG.
In general: conceptually "reusable" components.

### hooks
Specific `hooks` used in the APP.

### locales
The translation json for `i18n`

### mock
- ajax/handlers the functions for mock responses to HTTP requests
- data the mock data to be used instead of the DB

### pages
REACT components that rendering the "body" of the layout.
You intuitively start from the page, which is unique,
then go to the component that (theoretically) is used in several places.

### plugin
They are services accessible at any point in the program. 
They allow you to access an external service, translate, make calculations etc etc

### stores
They are the CONTROLLERs of the VIEWs.
The STORE is not the perfect solution but it works well in most cases!

BUSINESS LOGIC simply has to modify or read the STORE
without worrying about how VIEW is implemented.

It is ESSENTIAL for large projects because it allows you to:

- distribute the code on several units, improving maintainability
- clearly separates the VIEW from the BUSINESS LOGIC
- you can modify the VIEW or the CONTROLLER (keeping the same BINDs) independently

Maintaining the APP after years or by several people is something to be expected.
Impossible if you have a tree of components that pass functions and properties to you making them highly context dependent.

Using the STOREs I can copy and paste a component to another point of the APP without problems.
components **SHOULD HAVE NO PROPS**
The components **NOT HAVE PROPS** (with the exception, of course, of "children" or "className").

### Models and API
In reality in this TEMPLATE the APIs and the STOREs are "mixed"!
A questionable solution but given the simplicity of the API I didn't want to complicate the structure.
One could think of a "Models" folder for managing POCO objects
and "API" for HTTP requests.

## AJAX
Being a SPA, all data arrives via AJAX.
I built a very simple class [here](https://github.com/priolo/jon-template/blob/7f8c02cbd72371c1018f7a689ed625577f22f206/src/plugins/AjaxService.js#L11).
I wanted a default SINGLETON SERVICE that could keep some properties (for example `baseUrl`)
But if necessary, since it is a `class`, several instances can be created.

I can use STORE even outside REACT (and therefore in SERVICE AJAX)

For example, here I set the STATE `busy` of the STORE `layout` when the SERVICE is busy:
[in SERVICE (outside REACT)](https://github.com/priolo/jon-template/blob/7f8c02cbd72371c1018f7a689ed625577f22f206/src/plugins/AjaxService.js#L43)

```js
// I download the "layout" store
const { setBusy } = getStoreLayout()
// if necessary set "busy" == true
setBusy(true)
```

While in the [STORE layout](https://github.com/priolo/jon-template/blob/7f8c02cbd72371c1018f7a689ed625577f22f206/src/stores/layout/store.js#L14)

```js
// I define the `busy` prop in readable / writable
export default {
    state: {
        busy: false,
    }.
    mutators: {
        setBusy: (state, busy) => ({ busy }),
    }
}
```

[In VIEW](https://github.com/priolo/jon-template/blob/7f8c02cbd72371c1018f7a689ed625577f22f206/src/components/layouts/AppBar.jsx#L60)
I can catch this event

```js
function Header() {
    const { state: layout } = useLayout()
    return (
        <AppBar>
            {
                // In this case the "progress" is displayed if the SERVICE AYAX is busy
                layout.busy && <LinearProgress />
            }
        </AppBar>
    )
}
```

## I18N
Sooner or later you will have to use it .... so better think about it first!
It's not just for "translating" the app
It allows you not to have the content directly in the VIEW ... which is more beautiful !!!
It is useful for testing in Cypress: you can use the translation PATH to locate components
instead of the text (which may change).

Inside a REACT COMPONENT
use the HOOK to import the `t` translation function

```js
import { useTranslation } from 'react-i18next'
...
const {t} = useTranslation()
```

Translate via PATH

```js
<TableCell>{t("pag.user.tbl.username")}</TableCell>
```

Or, outside of a COMPONENT, use the [PLUGIN i18n](https://github.com/priolo/jon-template/blob/7f8c02cbd72371c1018f7a689ed625577f22f206/src/plugins/i18n.js)

```js
import i18n from "i18next"
...
const title = i18n.t("pag.default.dlg.router_confirm.title")
```

The translations are inside JSON files in the `src\locales` directory

[doc](https://react.i18next.com/getting-started)

## MOCK (MSW)
**The APP must work offline!** Of course with mock data

This allows to divide the tasks of those who do the FE and those who do the BE:
It is enough to share good documentation on the API (which must be done anyway)
You don't need the whole environment to develop.
It is also immediately "testable" (for example by Cypress).
Finally, the APP in mock can be presented as a demo to the CUSTOMER without "unexpected behavior" (= "panic")
Too many benefits!

I have configured and started [MSW](https://mswjs.io/) in [/plugins/msw.js](https://github.com/priolo/jon-template/blob/7f8c02cbd72371c1018f7a689ed625577f22f206/src/plugins/msw.js)
It is called [here](https://github.com/priolo/jon-template/blob/7f8c02cbd72371c1018f7a689ed625577f22f206/src/index.js#L8) starting a [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

> A `Service Worker` acts as a proxy between the APP and the WEB: "simulating" low-level network.
> This is cool because it is completely transparent to the APP:
> basically when you use fetch it still works ... even offline! The data is given to you by the `Service Worker`

In [mocks/ajax/handlers](https://github.com/priolo/jon-template/tree/7f8c02cbd72371c1018f7a689ed625577f22f206/src/mocks/ajax/handlers) there are simulated "CONTROLLERs"
In [mocks/data](https://github.com/priolo/jon-template/tree/7f8c02cbd72371c1018f7a689ed625577f22f206/src/mocks/data) there are ... the data! Used to emulate the DB

The APP starts the `Service Worker` if it is in `development` or the `REACT_APP_MOCK` environment variable is" true "(string!)

> Environment variables in CRA are documented [here](https://create-react-app.dev/docs/adding-custom-environment-variables/)
> However CRA (at compile time) takes from `.env` all variables that starting with `REACT_APP`
> and makes them available in the browser

Example: To "simulate" the response to the request of a `doc` object by its `id`

HTTP request:
`GET /api/docs/33`

taken from: [src/mocks/ajax/handlers/docs.js](https://github.com/priolo/jon-template/blob/7f8c02cbd72371c1018f7a689ed625577f22f206/src/mocks/ajax/handlers/docs.js#L18)

```js
import { rest } from "msw"
import list from "../../data/docs"

rest.get ('/api/docs/:id', (req, res, ctx) => {

    const id = req.params.id

    const doc = list.find(item => item.id == id)
    if (!doc) return res(ctx.status(404))

    return res(
        ctx.delay(500),
        ctx.status(200),
        ctx.json(doc)
    )
})
```

## ROUTING
Also in this case it is easy to choose: [reactrouter](https://reactrouter.com/web/guides/quick-start)

### CONDITIONAL RENDER based on the current browser URL?

Use `Switch` by specifying one or more `paths`

```jsx
/* ATTENTION: the order is important */
<Switch>
    <Route path={["/docs/:id"]}>
        <DocDetail />
    </Route>
    <Route path={["/docs"]}>
        <DocList />
    </Route>
    <Route path={["/", "/users"]}>
        <UserList />
    </Route>
</Switch>
```

### CHANGE THE PAGE in REACT?

Use the `useHistory` HOOK:
[src\components\app\Avatar.jsx](https://github.com/priolo/jon-template/blob/7f8c02cbd72371c1018f7a689ed625577f22f206/src/components/app/Avatar.jsx)

```js
import { useHistory } from "react-router-dom";

export default function Avatar() {
    const history = useHistory()
    const handleClickProfile = e => history.push("/profile")
    return ...
}
```

### CHANGE PAGE outside REACT?

Use the browser's native `history`

```js
window.history.push("/docs/33")
```

### Access the URL PARAMETERS?
Use the `useParams` HOOK.
[src\pages\doc\DocDetail.jsx](https://github.com/priolo/jon-template/blob/7f8c02cbd72371c1018f7a689ed625577f22f206/src/pages/doc/DocDetail.jsx)

```jsx
import { useParams } from "react-router"

export default function DocDetail() {
    const { id } = useParams()

    useEffect(() => {
        if (!id) fetchById(id)
    }, [id])

    return ...
}
```

### Confirm ON CHANGE
An example can also be found on the `react-router-dom` website [here](https://github.com/ReactTraining/history/blob/master/docs/blocking-transitions.md), I report it for completeness.

I created a custom hook [useConfirmationRouter](https://github.com/priolo/jon-template/blob/be1ebdb0cacddd049d0a6c78bf88dc0c152e4b55/src/hooks/useConfirmationRouter.js)

that simply blocks navigation and asks for confirmation to continue.

I use it in the detail of the DOC [here](https://github.com/priolo/jon-template/blob/be1ebdb0cacddd049d0a6c78bf88dc0c152e4b55/src/pages/doc/DocDetail.jsx#L44)

> **WARNING**
> Being the TEMPLATE a `SPA`:

> - On URL change it does not make any HTTP requests to the server but simply updates the rendering
> - Of course, the data is always retrieved via AJAX requests
> - The only requests "about the APP structure" is the first loading or reload of the page.
> - The SERVER must be set appropriately to always reply with the same page
> **P.S.:**
> Are you like me? Is installing a plugin always a doubt? What if this library doesn't do what I need? What if it becomes obsolete the day after putting it into production? What if the author  vows to God never to touch a pc again? What if I notice that there is an unsolvable BUG in the library? And then ... do you want to have full control of the software ??
> So ... this plugin could be replaced by managing the url with the STORE.
> But I will not cover the subject here :D

### LAZY IMPORT
It is very very simple! If we have to create a portal with many pages
Even if we `render` only one page at a time

with the classic `import` we load ALL COMPONENTs! Even the ones the user will never see!
To load COMPONENTs only if necessary you need to use a [native REACT function](https://it.reactjs.org/docs/code-splitting.html#reactlazy): `React.lazy`

I do it in the `Main` [here](https://github.com/priolo/jon-template/blob/41acdaad5bd4e11954da9960f5a9cee0324c426b/src/components/layouts/Main.jsx#L20)

```jsx
const DocDetail = lazy(() => import('../../pages/doc/DocDetail'))

export default function Main() {
    return (
        <Switch>
            <Route path={["/docs/:id"]}>
                <Suspense fallback={<div>LOADING...</div>}>
                    <DocDetail />
                </Suspense>
            </Route>
            ...
        </Switch>
    )
}
```

`Suspense` is also a `native` REACT component.
Allows you to view an alternate render while the component is loading.

### UI COMPONENTS
Of course you can make your own components (it doesn't take much)
but [Material-UI](https://material-ui.com/) is very used and solid!
Nothing else is needed!

### BINDING
First thing: link the STORE to the VIEW.
Remember `useState` BUT, instead of being in the COMPONENT REACT, it's in the STORE.

We define a STORE with a `value` in read / write

```jsx
export default {
    state: {
        value: "init value",
    },
    mutators: {
        setValue: (state, value) => ({ value }),
    },
}
```

I import the STORE and "binding" of its value in the COMPONENT REACT

```jsx
import { useStore } from "@priolo/jon"

export default function Form() {

  const { state, setValue, getUppercase } = useStore("myStore")

  return <TextField 
        value={state.value}
        onChange={e => setValue(e.target.value)}
    />
}
```

A [sandbox](https://codesandbox.io/s/example-1-5d2tt) (that does NOT use MATERIAL-UI)
To find out more, check out [Jon](https://github.com/priolo/jon)

However, in this TEMPLATE you can find the BINDINGS everywhere

### VALIDATOR
Form validation is always left for last 😄
There is a simple mechanism for validating Material-UI components.

Just connect a value to a `rule` (with a HOOK)
and assign the obtained `props` to the MATERIAL-UI component

```jsx
import { rules, useValidator } from "@priolo/jon";

function Form() {

    const { state: user, setSelectName } = useAccount()
    // I create a custom "rule". If there is a violation I return a string with the error
    const customRule = (value) => value?.length >= 3 ? null : "Enter at least 3 letters."
    // I link two "rules" with the STORE ACCOUNT property "user.select?.name"
    const nameProps = useValidator(user.select?.name, [rules.obligatory, customRule])
    // ... and I get "nameProps"

    return <TextField autoFocus fullWidth
        // report an error if the value does not meet one of the rules
        {...nameProps}
        value={user.select?.name}
        onChange={e => setSelectName(e.target.value)}
    />
}
```

And validate in the STORE before sending the data

```jsx
import { validateAll } from "@priolo/jon"

const store = {
    state: {
        select: { name: "" },
    },
    actions: {
        save: async (state, _, store) => {
            // check if there is an error in the displayed "rules"
            const errs = validateAll()
            // if there are errors I can view them ... or ignore them :)
            if ( errs.length > 0 ) return false
            // else ... save! 
        },
    },
    mutators: {
        setSelectName: (state, name) => ({ select: {...state.select, name} }),
    },
}
```

an example [here](https://github.com/priolo/jon-template/blob/5593323c8a3ca30ed9023e6708124a191552b13e/src/stores/user/store.js#L73)

### DYNAMIC THEME

Once you understand how the STORES work, you use them for everything
... of course also to manage the THEME

In the [STORE `layout`](https://github.com/priolo/jon-template/blob/177dca2bafb4e1cf2fa22dfc2a45a703a89c6c04/src/stores/layout/store.js) I put everything that characterizes the general appearance of the APP
The THEME of MATERIAL-UI
but also the title on the AppBar, if the APP is waiting (loading ...), if the side DRAWERS are open, the main menu, the "message box", where the focus is set etc etc

However the THEME settings must be kept even when **reload the page**
The problem is that in this case the browser makes a new request to the server and the **STORE is reloaded from scratch**!
So I used the `coockies` to store the name of the selected THEME
you can see it [here](https://github.com/priolo/jon-template/blob/336589e17b1fa05a198f1d24322b9c78bbeff0ca/src/stores/layout/store.js#L20)

The store theme is initially set with the cookie
and when the THEME is changed. ([here](https://github.com/priolo/jon-template/blob/336589e17b1fa05a198f1d24322b9c78bbeff0ca/src/stores/layout/store.js#L70))

```jsx
export default {
    state: {
        theme: Cookies.get('theme'),
    },
    mutators: {
        setTheme: (state, theme) => {
            Cookies.set("theme", theme)
            return { theme }
        },
    }
}
```

Even if you use the cookies to memorize the name of the THEME
however, it is necessary to modify the STORE variable (more correctly "the STATE of the store")
Otherwise the VIEW does not receive the event!
In general the VIEW updates ONLY IF the `state` object of the STORE changes

### Responsive Design
There are tools in MATERIAL-UI for this [here](https://material-ui.com/guides/responsive-ui/)
But what if we don't use MATERIAL-UI?

We can use the STORE! I initialize the STORE by hooking it to the window resize event

```jsx
const store =  {
    state: {
        device: null,
    },
    // chiamato UNA SOLA VOLTA per inizializzare lo store
    init: (store) => {
        const checkDevice = ()=> {
            const deviceName = window.innerWidth < 767 ? "mobile" 
                : window.innerWidth < 950 ? "pad"
                : "desktop"
            store.setDevice(deviceName)
        }
        window.addEventListener("resize", (e) => checkDevice());
        checkDevice()
    },
    mutators: {
        setDevice: ( state, device ) => ({ device }),
    },
}
```

And I use it to modify the VIEW based on the device

```jsx
function MainDrawer () {
    const { state: layout } = useLayout()
    const variant = layout.device == "desktop" ? "persistent" : null

    return (
        <Drawer
            variant={variant}
            ...
        >
            ...
        </Drawer>
    )
}
```

Of course you can also use it for: classes and style css or conditional render

---

## URL
## SEARCH AND FILTER

If I use a WEB APP and I copy the URL and send it to a friend

I expect him to see exactly what I see (with the same permissions of course)
Then the selected TABs, filters and sorting on the lists.

They must be kept in the [`search` of the current URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/search) (also called *query string*)
... in short, what is after the "?" in the URL

In STORE [Route](https://github.com/priolo/jon-template/blob/336589e17b1fa05a198f1d24322b9c78bbeff0ca/src/stores/route/store.js) I can get or set a variable of `query string` which can be used in VIEW

An excerpt from the STORE:

```jsx
export default {
    state: {
        queryUrl: "",
    },
    getters: {
        getSearchUrl: (state, name, store) => {
            const searchParams = new URLSearchParams(window.location.search)
            return (searchParams.get(name) ?? "")
        },
    },
    mutators: {
        setSearchUrl: (state, { name, value }) => {
            const queryParams = new URLSearchParams(window.location.search)
            if (value && value.toString().length > 0) {
                queryParams.set(name, value)
            } else {
                queryParams.delete(name)
            }
            window.history.replaceState(null, null, "?" + queryParams.toString())
            return { queryUrl: queryParams.toString() }
        },
    },
}
```

then I use it in the [list](https://github.com/priolo/jon-template/blob/336589e17b1fa05a198f1d24322b9c78bbeff0ca/src/pages/doc/DocList.jsx) to filter the elements

```jsx
function DocList() {
    const { state: route, getSearchUrl } = useRoute()
    const { state: doc } = useDoc()

    // it is executed only if the filter or the "docs" changes
    const docs = useMemo (
        // actually I do this in the STORE DOC
        () => {
            // I get the "search" value in the current url 
            let txt = getSearchUrl("search").trim().toLowerCase()
            // I filter all the "docs" and return them
            return doc.all.filter(doc => !txt || doc.title.toLowerCase().indexOf(txt) != -1)
        },
        [doc.all, route.queryUrl]
    )

    // render of docs
    return {docs.map(doc => (
        ...
    ))}
}
```

meanwhile in the [HEADER](https://github.com/priolo/jon-template/blob/336589e17b1fa05a198f1d24322b9c78bbeff0ca/src/pages/user/UserHeader.jsx) I have the text-box to modify the filter

```jsx
import { useRoute } from "../../stores/route"

function Header() {
    const { getSearchUrl, setSearchUrl } = useRoute()
    return (
        <SearchBox
            value={getSearchUrl("search")}
            onChange={value => setSearchUrl({ name: "search", value })}
        />
    )
}
```

To recap: With the `SearchBox` I change the url
linked (via the store STORE `route`) to the VIEW `DocList`

and then this updates the list.
If I were to duplicate the page in the browser the filter would remain intact.

---

## AUTH
The AUTH is not complete (a matter of time ... I'll finish it)!

It is managed by the STORE `auth` [here](https://github.com/priolo/jon-template/blob/be1ebdb0cacddd049d0a6c78bf88dc0c152e4b55/src/stores/auth/store.js)

### JWT (JSON Web Token)
**How does it work?**
This is a `token` (ie an "identifier string") that the server gives to the client when the client logs in successfully.

At this point the client at each subsequent request no longer has to authenticate,
but it just puts the `token` in the **HEADER** of the HTTPS request.

Or the server puts the `token` in an **HttpOnly COOKIE**, and will find it on every request.
In this case javascript will not be able to access the token (more secure)

The server seeing the correct `token` and assumes that that HTTP request was made by someone who has already passed authentication.

User data is directly in the `token` (including permissions): there is no need to query the db
The `token` have an "expiration" forcing the client to re-authenticate to generate a new `token`.
Of course you have to use an HTTPS connection to be safe.

Assuming you want to implement the token in the HEADER:
The ajax plugin includes the token if available [here](https://github.com/priolo/jon-template/blob/be1ebdb0cacdd049d0a6c78bf88dc0c152e4b55/src/plugins/AjaxService.js#L52)

```jsx
import { getStoreAuth } from "../stores/auth"
...

export class AjaxService {
    ...
    async send(url, method, data) {
        const { state:auth } = getStoreAuth()
        ...

        const response = await fetch(
            url,
            {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    ...auth.token && { "Authorization": auth.token }
                },
                body: data,
            }
        )

        ...
    }
    ...
}
```

The token is accessible in the [STORE auth](https://github.com/priolo/jon-template/blob/be1ebdb0cacddd049d0a6c78bf88dc0c152e4b55/src/stores/auth/store.js).
I used cookies to avoid having to login again on "reload" (*it does not work with MSW*)

>Cookies should only be used with HTTPS

```jsx
import Cookies from 'js-cookie'

export default {
    state: {
        token: Cookies.get('token'),
    },
    getters: {
        isLogged: state => state.token != null,
    },
    mutators: {
        setToken: (state, token, store) => {
            if (token == null) {
                Cookies.remove('token')
            } else {
                Cookies.set('token', token)
            }
            return { token }
        },
    }
}
```

# TECNOLOGY
Template di uno stack tecnologico
per realizzare un Front End SPA

## MANAGE PROJECT
[CRA](https://create-react-app.dev/)

## VIEW LIBRARY
[React](https://reactjs.org/)

## STORE
[Jon](https://github.com/priolo/jon)

## COMPONENTS
[Material-UI](https://material-ui.com/)

## ROUTER
[reactrouter](https://reactrouter.com/web/guides/quick-start)

## INTERNAZIONALIZZATION
[react-i18next](https://react.i18next.com/)

## MOCK
[msw](https://mswjs.io/)

## TEST
[Cycpress](https://www.cypress.io/)