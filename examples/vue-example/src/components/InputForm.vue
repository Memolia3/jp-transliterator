<script setup lang="ts">
import { ref } from 'vue';
import ShowRomanSentence from './ShowRomanSentence.vue';
import ShowJapaneseSentence from './ShowJapaneseSentence.vue';

const romanSentence = ref('');
const japaneseSentence = ref('');

function handleRomanInput(event: Event) {
    const target = event.target as HTMLInputElement;
    romanSentence.value = target.value;
}

function handleJapaneseInput(event: Event) {
    const target = event.target as HTMLInputElement;
    japaneseSentence.value = target.value;
}
</script>

<template>
    <div class="input-form">
        <div class="input-form-roman">
            <label for="roman">ローマ字を入力してください</label>
            <input id="roman" @input="handleRomanInput" :value="romanSentence" />
            <ShowJapaneseSentence :roman-sentence="romanSentence" />
        </div>
        <div class="input-form-japanese">
            <label for="japanese">日本語を入力してください</label>
            <input id="japanese" @input="handleJapaneseInput" :value="japaneseSentence" />
            <ShowRomanSentence :japanese-sentence="japaneseSentence" />
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

    &-roman,
    &-japanese {
        display: flex;
        flex-direction: column;
        margin-bottom: 20px;
    }
}

input {
    width: 300px;
}
</style>