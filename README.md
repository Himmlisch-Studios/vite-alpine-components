# Alpine Components for ViteJS

Straight-forward, template engine-like, compilation plugin, to create components/partials that work directly with Alpine.

```html
<x-MyAlpineComponent 
    :id="$id('anAttribute')"
    x-data="{ aProp: 'nice' }"
    class="my-passed-class" />
```

## Usage

Install using NPM.

```
npm install vite-alpine-components
```

Import it in your Vite config.

```ts
import alpineComponents from "vite-alpine-components";

export default defineConfig({
    plugins: [
        alpineComponents({ 
            paths: ["components/**/*.html"], // Relative to src/
            strict: true,
         }),
    ],
});
```

You can now define a HTML component.

```html
<!-- src/components/Card.html -->
<div class="px-5 py-2 rounded-3xl">
    <h1 x-text="title"> </h1>
    <p x-text="content"></p>
</div>
```

Alongside, you need to define the same component in Alpine.

```js
// src/main.js or maybe src/components/Card.js
Alpine.data('Card', ({
    title = 'Default',
    content = 'Lorem ipsum'
} = {}) => {

    return {
        title,
        content,
        init(){

        }
    }
});
```

Finally, use your component using the `x-` prefix.

```html
<!-- src/index.html -->
<div class="grid grid-cols-2 gap-5">
    <x-Card x-data="{title: 'Hello', content: 'World!'}" />
    <x-Card x-data="{title: 'Fizz', content: 'Buzz!'}" class="bg-yellow-500" />
<div>
```

As you can see, we use `x-data` to pass the props, but this is not the real `x-data` that gets compiled. 

The compiled version is an `x-data` calling the component name with any argument passed, in the following form: `MyComponent(%Anything in x-data%)`.

Using one of the cards as an example, the compiled output would look like this:

```html
<div x-data="Card({title: 'Fizz', content: 'Buzz!'})" class="px-5 py-2 rounded-3xl bg-yellow-500">
    <h1 x-text="title"> </h1>
    <p x-text="content"></p>
</div>
```

Any `class` or `style` will be merged automatically.

### Using without Alpine

The plugin includes an option called `strict`, if you set it to false, you'll be able to include any partial that doesn't uses Alpine.

```html
<div class="flex justify-between gap-5">
    <!-- This would throw an Error since the dash can't be parsed to a JS call in `x-data`, disabling strict will allow to inject the HTML without Alpine -->
    <x-partial-logo />
    
    <!-- Normal Alpine component -->
    <x-Navbar />
</div>
```

## Credits

Thanks to [@donnikitos](https://github.com/donnikitos) for creating [vite-plugin-html-inject](https://github.com/donnikitos/vite-plugin-html-inject).