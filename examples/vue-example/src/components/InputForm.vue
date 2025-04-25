<script setup lang="ts">
import { ref } from 'vue';
import ShowRomanSentence from './ShowRomanSentence.vue';

const romanSentence = ref('');

function handleRomanInput(event: Event) {
    const target = event.target as HTMLInputElement;
    romanSentence.value = target.value;
}
</script>

<template>
    <div class="input-form">
        <div class="input-form-roman">
            <label for="roman">日本語を入力してください</label>
            <input id="roman" @input="handleRomanInput" :value="romanSentence" />
            <ShowRomanSentence :japanese-sentence="romanSentence" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.input-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
    padding: 10px;

    &-roman {
        display: flex;
        flex-direction: column;
        margin-bottom: 20px;
    }
}

input {
    width: 300px;
}
</style>