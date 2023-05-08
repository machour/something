import { InvalidCallException } from "./InvalidCallException";
import { UnknownPropertyException } from "./UnknownPropertyException";

function uppercaseFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export class BaseObject {
    className() {
        return this.constructor.name;
    }
    static className() {
        return this.constructor.name;
    }
    constructor() {
        return new Proxy(this, {
            /**
             * Sets value of an object property.
             *
             * @param {object} instance the current instance
             * @param {string} key the property name
             * @param {*} value the property value
             * @throws {UnknownPropertyException} if the property is not defined
             * @throws {InvalidCallException} if the property is read-only
             */
            set(instance, key, value) {
                const setter = `set${uppercaseFirst(key)}`;
                if (typeof instance[setter] === "function") {
                    instance[setter](value);
                    return true;
                }

                const getter = `get${uppercaseFirst(key)}`;
                if (typeof instance[getter] === "function") {
                    throw new InvalidCallException(
                        `Setting read-only property: ${instance.constructor.name}::${key}`
                    );
                }

                throw new UnknownPropertyException(
                    `Setting unknown property: ${instance.constructor.name}::${key}`
                );
            },
            /**
             * Returns the value of an object property.
             *
             * @param {object} instance the current instance
             * @param {string} key the property name
             * @return {*} the property value
             * @throws {UnknownPropertyException} if the property is not defined
             * @throws {InvalidCallException} if the property is write-only
             * @see __set()
             */
            get(instance, key) {
                if (typeof instance[key] !== "undefined") {
                    return instance[key];
                }

                const getter = `get${uppercaseFirst(key)}`;
                if (typeof instance[getter] === "function") {
                    return instance[getter]();
                }

                const setter = `set${uppercaseFirst(key)}`;
                if (typeof instance[setter] === "function") {
                    throw new InvalidCallException(
                        `Getting write-only property: ${instance.constructor.name}::${key}`
                    );
                }

                throw new UnknownPropertyException(
                    `Getting unknown property: ${instance.constructor.name}::${key}`
                );
            },
            has(instance, key) {
                return typeof instance[key] !== "undefined" || typeof instance[`get${uppercaseFirst(key)}`] === "function"
            },
            deleteProperty(instance, key) {
                const setter = `set${uppercaseFirst(key)}`;
                if (typeof instance[setter] === "function") {
                    instance[setter](null);
                    return true;
                }

                const getter = `get${uppercaseFirst(key)}`;
                if (typeof instance[getter] === "function") {
                    throw new InvalidCallException(
                        `Unsetting read-only property: ${instance.constructor.name}::${key}`
                    );
                }

                return true;
            }
        });
    }
}
