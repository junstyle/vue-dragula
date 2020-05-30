import dragula from 'dragula'
import Vue from 'vue'

if (!dragula) {
    throw new Error('[vue-dragula] cannot locate dragula.')
}

class DragulaService {
    constructor(Vue) {
        this.bags = [] // bag store
        this.eventBus = new Vue()
        this.events = [
            'cancel',
            'cloned',
            'drag',
            'dragend',
            'drop',
            'out',
            'over',
            'remove',
            'shadow',
            'dropModel',
            'removeModel'
        ]
    }

    add(name, drake) {
        let bag = this.find(name)
        if (bag) {
            throw new Error('Bag named: "' + name + '" already exists.')
        }
        bag = {
            name,
            drake
        }
        this.bags.push(bag)
        if (drake.models) {
            this.handleModels(name, drake)
        }
        if (!bag.initEvents) {
            this.setupEvents(bag)
        }
        return bag
    }

    find(name) {
        let bags = this.bags
        for (var i = 0; i < bags.length; i++) {
            if (bags[i].name === name) {
                return bags[i]
            }
        }
    }

    handleModels(name, drake) {
        if (drake.registered) { // do not register events twice
            return
        }
        let dragElm
        let dragIndex
        let dropIndex
        let sourceModel

        drake.on('remove', (el, container, source) => {
            if (!drake.models) {
                return
            }

            sourceModel = this.findModelForContainer(source, drake)
            setTimeout(() => {
                sourceModel.splice(dragIndex, 1)
                // drake.cancel(true)
                this.eventBus.$emit('removeModel', { name, el, source, dragIndex })
            }, 300)
        })

        drake.on('drag', (el, source) => {
            dragElm = el
            dragIndex = this.domIndexOf(el, source)
        })

        drake.on('drop', (dropElm, target, source) => {
            if (!drake.models || !target) {
                return
            }
            dropIndex = this.domIndexOf(dropElm, target)
            sourceModel = this.findModelForContainer(source, drake)

            if (target === source) {
                setTimeout(() => {
                    sourceModel.splice(dropIndex, 0, sourceModel.splice(dragIndex, 1)[0])
                    this.eventBus.$emit('dropModel', { name, dropElm, target, source, dropIndex })
                }, 300)
            } else {
                let notCopy = dragElm === dropElm
                let targetModel = this.findModelForContainer(target, drake)
                let dropElmModel = notCopy ? sourceModel[dragIndex] : JSON.parse(JSON.stringify(sourceModel[dragIndex]))

                setTimeout(() => {
                    if (notCopy) {
                        sourceModel.splice(dragIndex, 1)
                    }
                    targetModel.splice(dropIndex, 0, dropElmModel)
                    this.eventBus.$emit('dropModel', { name, dropElm, target, source, dropIndex })
                }, 300)
                // drake.cancel(true)
            }
        })

        drake.registered = true
    }

    destroy(name) {
        let bag = this.find(name)
        if (!bag) { return }
        let bagIndex = this.bags.indexOf(bag)
        this.bags.splice(bagIndex, 1)
        bag.drake.destroy()
    }

    setOptions(name, options) {
        let bag = this.add(name, dragula(options))
        this.handleModels(name, bag.drake)
    }

    setupEvents(bag) {
        bag.initEvents = true
        let _this = this
        let emitter = type => {
            function replicate() {
                let args = Array.prototype.slice.call(arguments)
                _this.eventBus.$emit(type, [bag.name].concat(args, bag.drake))
            }
            bag.drake.on(type, replicate)
        }
        this.events.forEach(emitter)
    }

    domIndexOf(child, parent) {
        return Array.prototype.indexOf.call(
            parent.children,
            child
        )
    }

    findModelForContainer(container, drake) {
        return (this.findModelContainerByContainer(container, drake) || {}).model
    }

    findModelContainerByContainer(container, drake) {
        if (!drake.models) {
            return
        }
        return drake.models.find(model => model.container === container)
    }
}

export default DragulaService
