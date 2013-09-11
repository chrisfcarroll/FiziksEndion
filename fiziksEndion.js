var FiziksEndion;
(function (FiziksEndion) {
    /**
    * @class Vector3 : 3-d vectors of numbers.
    * Statically typed with functions for basic maths operations.
    * Instances of Vector3 are intended to be immutable, so operations return new instances.
    */
    var Vector3 = (function () {
        function Vector3(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        Vector3.prototype.magnitudeSquared = function () {
            return this.x * this.x + this.y * this.y + this.z * this.z;
        };
        Vector3.prototype.magnitude = function () {
            return Math.sqrt(this.magnitudeSquared());
        };
        Vector3.prototype.direction = function () {
            var size = this.magnitude();
            return new Vector3(this.x / size, this.y / size, this.z / size);
        };
        Vector3.prototype.timesScalar = function (scalar) {
            return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
        };
        Vector3.prototype.add = function (right) {
            return new Vector3(this.x + right.x, this.y + right.y, this.z + right.z);
        };

        Vector3.zero = new Vector3(0, 0, 0);

        Vector3.sum = function (arrayOfVector3s) {
            var totalx = 0, totaly = 0, totalz = 0;
            arrayOfVector3s.forEach(function (el) {
                totalx += el.x;
                totaly += el.y;
                totalz += el.z;
            });
            return new Vector3(totalx, totaly, totalz);
        };
        return Vector3;
    })();
    FiziksEndion.Vector3 = Vector3;
})(FiziksEndion || (FiziksEndion = {}));
/// <reference path="lib/underscore-typed.d.ts" />
/// <reference path="fiziksEndionVector.ts"/>
/**
* @module FiziksEndion. A simple javascript physics engine.
*/
var FiziksEndion;
(function (FiziksEndion) {
    /**
    * A prototype for creating new instances which implement interface Body.
    * Helper functions wrap() and augment() turn an existing object into a Body by, respectively,
    * augmenting it with the required missing functions,
    * wrapping it in an object having property get/setters which reference the wrapped object.
    */
    FiziksEndion.Body = {
        momentum: FiziksEndion.Vector3.zero,
        velocity: function () {
            return this.momentum.timesScalar(1.0 / this.mass);
        },
        moveBy: function (vector) {
            this.location = this.location.add(vector);
        },
        /**
        * wrap an object so it can be treated as a Body in the physics engine.
        * The object to be wrapped must already a mass defined, or a value must be provided.
        */
        wrap: function (objectAsBody, mass, location, momentum) {
            var massBackingField = mass;
            var getMassBackingFn = mass ? function () {
                return massBackingField;
            } : function () {
                return objectAsBody.mass;
            };
            var setMassBackingFn = mass ? function (m) {
                massBackingField = m;
            } : function (m) {
                objectAsBody.mass = m;
            };

            var wrapper = Object.create(this);
            Object.defineProperties(wrapper, {
                get mass() {
                    return getMassBackingFn();
                },
                set mass(m) {
                    setMassBackingFn(m);
                },
                location: location,
                momentum: momentum,
                velocity: FiziksEndion.Body.velocity,
                moveBy: FiziksEndion.Body.moveBy
            });
            return wrapper;
        },
        /**
        * Makes an object implement Body by augmenting it with the necessary methods.
        * @param object : Must already have properties mass and location.
        */
        augment: function (object, mass, location, momentum) {
            if (mass) {
                object.mass = mass;
            } else if (object.mass === undefined) {
                throw { error: "object must have a mass, or you must specify one, to be used as a body." };
            }

            if (location) {
                object.location = location;
            } else if (object.location === undefined) {
                throw { error: "object must have a location, or you must specify one, to be used as a body." };
            }

            if (momentum) {
                object.momentum = momentum;
            } else if (object.momentum === undefined) {
                object.momentum = FiziksEndion.Vector3.zero;
            }

            if (object.moveBy !== undefined && object.moveBy !== this.moveBy) {
                throw { message: "moveBy is already defined but not as FiziksEndion.Body.moveBy" };
            }
            object.moveBy = FiziksEndion.Body.moveBy;
            object.velocity = FiziksEndion.Body.velocity;
            return object;
        }
    };

    var BigSelfPoweredConstantDirectionEngine = (function () {
        function BigSelfPoweredConstantDirectionEngine(force, energyStored, physics) {
            if (typeof force === "undefined") { force = FiziksEndion.Vector3.zero; }
            if (typeof energyStored === "undefined") { energyStored = 0; }
            if (typeof physics === "undefined") { physics = FiziksEndion.defaultPhysics; }
            this.force = force;
            this.energyStored = energyStored;
            this.physics = physics;
        }
        BigSelfPoweredConstantDirectionEngine.prototype.attachTo = function (body) {
            this.attachedBody = body;
            body.engines = body.engines || [this];
        };
        return BigSelfPoweredConstantDirectionEngine;
    })();
    FiziksEndion.BigSelfPoweredConstantDirectionEngine = BigSelfPoweredConstantDirectionEngine;

    var UniverseImpl = (function () {
        function UniverseImpl(bodies, _physics, entropy) {
            if (typeof _physics === "undefined") { _physics = FiziksEndion.defaultPhysics; }
            if (typeof entropy === "undefined") { entropy = 0; }
            this.bodies = bodies;
            this._physics = _physics;
            this.entropy = entropy;
        }
        UniverseImpl.prototype.totalMomentum = function () {
            return this._physics.principleOfInertia.invariant(this);
        };

        UniverseImpl.prototype.totalKineticEnergy = function () {
            return this._physics.kineticEnergy(this.bodies);
        };
        return UniverseImpl;
    })();

    FiziksEndion.newtonianLinearMechanics = (function () {
        var me = {
            forceFields: [],
            //public kineticEnergy(bodies:Body[])
            //public kineticEnergy(body:Body)
            kineticEnergy: function (b) {
                var _this = this;
                if (b.momentum) {
                    return b.momentum.magnitudeSquared() / b.mass / 2;
                } else {
                    return _.sum(b.map(function (b) {
                        return _this.kineticEnergy(b);
                    }));
                }
            },
            principleOfInertia: {
                apply: function (bodies, timeInterval) {
                    bodies.forEach(function (unforcedBody) {
                        unforcedBody.moveBy(unforcedBody.momentum.timesScalar(timeInterval / unforcedBody.mass));
                    });
                },
                invariant: function (universe) {
                    return FiziksEndion.Vector3.sum(universe.bodies.map(function (b) {
                        return b.momentum;
                    }));
                }
            },
            lawOfConservationOfEnergy: {
                apply: function (bodies, timeInterval) {
                    _.filter(bodies, function (body) {
                        return body.engines != undefined;
                    }).forEach(function (body) {
                        (body.engines).forEach(function (engine) {
                            var initialKineticEnergy = FiziksEndion.newtonianLinearMechanics.kineticEnergy(body);

                            body.moveBy(engine.force.timesScalar(timeInterval * timeInterval / body.mass / 2));
                            body.momentum = body.momentum.add(engine.force.timesScalar(timeInterval));

                            var energyUsed = FiziksEndion.newtonianLinearMechanics.kineticEnergy(body) - initialKineticEnergy;
                            engine.energyStored -= energyUsed;
                        });
                    });
                },
                invariant: function (universe) {
                    var sumOfEnergyInAttachedEngines = _.sum(universe.bodies.map(function (body) {
                        return body.engines ? _.sum(((body.engines)).map(function (e) {
                            return e.energyStored;
                        })) : 0;
                    }));

                    return FiziksEndion.newtonianLinearMechanics.kineticEnergy(universe.bodies) + sumOfEnergyInAttachedEngines + universe.entropy;
                }
            },
            timeInvariants: []
        };
        me.timeInvariants = [me.principleOfInertia, me.lawOfConservationOfEnergy];
        return me;
    })();

    FiziksEndion.defaultPhysics = FiziksEndion.newtonianLinearMechanics;

    function ReferenceFrame(bodies, physics) {
        var physics = physics || FiziksEndion.defaultPhysics;
        bodies.forEach(function (b) {
            FiziksEndion.Body.augment(b);
        });
        this.universe = new UniverseImpl(bodies, physics);
        var time = 0;

        this.age = function (timeInterval) {
            if (timeInterval !== undefined) {
                physics.timeInvariants.forEach(function (invariant) {
                    invariant.apply(bodies, timeInterval);
                });
                time += timeInterval;
            }
            return time;
        };
    }
    FiziksEndion.ReferenceFrame = ReferenceFrame;
})(FiziksEndion || (FiziksEndion = {}));
/// <reference path="lib/underscore-typed.d.ts" />
/// <reference path="fiziksEndionVector.ts"/>
var FiziksEndion;
(function (FiziksEndion) {
    _.sum = function (list) {
        return _.reduce(list, function (sumSoFar, nextValue) {
            return sumSoFar + nextValue;
        }, 0);
    };
})(FiziksEndion || (FiziksEndion = {}));
//# sourceMappingURL=fiziksEndion.js.map
