import directive from './vue-dragula'

const VueDragula = {
    install(Vue, options) {
        // const major = Number(Vue.version.split('.')[0])
        // const minor = Number(Vue.version.split('.')[1])
        // if (major < 2 && minor < 1) {
        //     throw new Error(`v-dragula supports vue version 2.1 and above. You are using Vue@${Vue.version}. Please upgrade to the latest version of Vue.`)
        // }
        // registration
        Vue.directive('dragula', directive)
    },
}

if (typeof window !== 'undefined' && window.Vue) {
    window.VueDragula = VueDragula
    window.Vue.use(VueDragula)
}

export { directive as dragula }
export default VueDragula