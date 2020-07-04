import dragula from 'dragula'
import DragulaService from './service'

if (!dragula) {
    throw new Error('[vue-dragula] cannot locate dragula.')
}

const service = new DragulaService()

export default {

    bind(container, binding, vnode) {
        let model, drake, bag,
            bindingVal = binding.value ? binding.value : [],
            options = {},
            bagName = vnode.data.attrs.bag || 'globalBag'

        if (Array.isArray(bindingVal)) {
            model = bindingVal
        } else {
            model = bindingVal.model ? bindingVal.model : []
            if (bindingVal.options)
                Object.assign(options, bindingVal.options)
        }

        bag = service.find(bagName)
        if (bag) {
            drake = bag.drake
            drake.containers.push(container)
            drake.setOptions(options)
            drake.models.push({ model, container })
        } else {
            drake = dragula(options)
            drake.movable = options.movable || function () { return true }  //不同于dragula的moves设置项，它是用来准确获取dragIndex
            delete options.movable
            drake.containers.push(container)
            drake.models = [{ model, container }]
            bag = service.add(bagName, drake)

            if (bindingVal.events) {
                Object.keys(bindingVal.events).map(evt => {
                    let handler = function () {
                        bindingVal.events[evt](bag, ...arguments)
                    }
                    drake.on(evt, handler)
                })
            }
        }
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
        let unbindBagName = vnode.data.attrs.bag || 'globalBag'

        let drake = service.find(unbindBagName).drake
        if (!drake) return

        let containerIndex = drake.containers.indexOf(container)
        if (containerIndex > -1) {
            drake.containers.splice(containerIndex, 1)
            drake.models.splice(containerIndex, 1)
        }
        if (drake.containers.length === 0) {
            service.destroy(unbindBagName)
        }
    },

}