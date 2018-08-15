<template>
  <div id="app">
    <div class="header">
      <h1 class="header__title">
        <router-link :to="{ name: 'homepage' }">Authenticity</router-link>
      </h1>
    </div>
    <router-view class="container"></router-view>
  </div>
</template>


<script>
export default {
  name: 'App'
}
</script>


<style lang="scss">
@import 'variables';

body, html {
  margin: 0;
  padding: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  background: #f0f0f0;
}
html {
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
}
.header {
  background: $baseColor;
  margin-bottom: 1em;

  &__title {
    padding: 0.5em;
    margin: 0;
    color: #FFF;

    a {
      color: #FFF;
    }
  }
}
.container {
  width: 100%;
  max-width: 700px;
  margin: auto;
  padding: 0 0.5em;
}
</style>
