import Vue from 'vue'
import dragula from 'dragula'
import DragulaService from './service'

if (!dragula) {
    throw new Error('[vue-dragula] cannot locate dragula.')
}

export default function () {
    const service = new DragulaService(Vue)

    let name = 'globalBag'
    let drake

    Vue.vueDragula = {
        options: service.setOptions.bind(service),
        find: service.find.bind(service),
        eventBus: service.eventBus
    }

    /**
     * v-dragula="items"
     * v-dragula="{model: items, options: {copy: true}, events: {drop: onDropEvent}}"
     */
    Vue.directive('dragula', {

        bind(container, binding, vnode) {
            let model = null
            let bindingVal = binding.value ? binding.value : []
            let options = { containers: [container] }
            if (Array.isArray(bindingVal)) {
                model = bindingVal
            } else {
                model = bindingVal.model ? bindingVal.model : []
                if (bindingVal.options)
                    options = Object.assign({}, options, bindingVal.options)
            }

            const bagName = vnode.data.attrs.bag

            if (bagName !== undefined && bagName.length !== 0) {
                name = bagName
            }
            const bag = service.find(name)
            if (bag) {
                drake = bag.drake
                drake.containers.push(container)
                if (drake.models == undefined) drake.models = []
                drake.models.push({ model, container })
                return
            }

            drake = dragula(options)
            if (bindingVal.events) {
                Object.keys(bindingVal.events).map(evt => {
                    drake.on(evt, bindingVal.events[evt])
                })
            }
            drake.models = [{ model, container }]

            service.add(name, drake)
            service.handleModels(name, drake)
        },

        // update(container, binding, vnode) {
        //     const newValue = binding.value
        //     if (!newValue) return

        //     const bagName = vnode.data.attrs.bag
        //     if (bagName !== undefined && bagName.length !== 0) {
        //         name = bagName
        //     }
        //     const bag = service.find(name)
        //     drake = bag.drake

        //     let modelContainer = service.findModelContainerByContainer(container, drake)

        //     if (modelContainer) {
        //         modelContainer.model = newValue
        //     } else {
        //         drake.models.push({
        //             model: newValue,
        //             container
        //         })
        //     }
        // },

        unbind(container, binding, vnode) {
            let unbindBagName = 'globalBag'
            const bagName = vnode.data.attrs.bag

            if (bagName !== undefined && bagName.length !== 0) {
                unbindBagName = bagName
            }
            var drake = service.find(unbindBagName).drake
            if (!drake) return
            var containerIndex = drake.containers.indexOf(container)
            if (containerIndex > -1) {
                drake.containers.splice(containerIndex, 1)
            }
            if (drake.containers.length === 0) {
                service.destroy(unbindBagName)
            }
        }

    })
}

