<template>
  <div>
    <h1>What do you wish to do?</h1>
    <div class="options">
      <router-link :to="{ name: 'create' }" class="options__option">
        <el-button type="primary" icon="el-icon-edit">Create a key</el-button>
      </router-link>

      <router-link :to="{ name: 'validate' }" class="options__option">
        <el-button type="primary" icon="el-icon-view">Verify authenticity</el-button>
      </router-link>
    </div>
  </div>
</template>

<script>
</script>


<style lang="scss" scoped>
h1 {
  text-align: center;
}
.options {
  text-align: center;

  &__option {
    margin: 0.3em;
  }
}
</style>
