import { defineStore } from 'pinia'

export const useSearchStore = defineStore('searchStore', {
    state: () => ({
        query: '',
    }),
    actions: {
        setQuery(query: string) {
            this.query = query
        },
    },
})
