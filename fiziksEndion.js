/// <reference path="lib/underscore-typed.d.ts" />
_.sum = function (list) {
    return _.reduce(list, function (sumSoFar, nextValue) {
        return sumSoFar + nextValue;
    }, 0);
};

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

var bodyRoot = {
    momentum: Vector3.zero,
    velocity: function () {
        return this.momentum.timesScalar(1.0 / this.mass);
    },
    moveBy: function (vector) {
        this.location = this.location.add(vector);
    },
    applyForce: function (force, timeInterval) {
        this.moveBy(force.timesScalar(timeInterval * timeInterval / this.mass / 2));
        this.momentum = this.momentum.add(force.timesScalar(timeInterval));
    }
};

var Universe = (function () {
    function Universe(bodies, _physics, entropy) {
        if (typeof _physics === "undefined") { _physics = Physics.Current; }
        if (typeof entropy === "undefined") { entropy = 0; }
        this.bodies = bodies;
        this._physics = _physics;
        this.entropy = entropy;
    }
    Universe.prototype.totalMomentum = function () {
        return this._physics.principleOfInertia.invariant(this);
    };

    Universe.prototype.totalKineticEnergy = function () {
        return this._physics.lawOfConservationOfEnergy.invariant(this);
    };
    return Universe;
})();

var BigSelfPoweredConstantDirectionEngine = (function () {
    function BigSelfPoweredConstantDirectionEngine(force, initialEnergy) {
        if (typeof force === "undefined") { force = Vector3.zero; }
        if (typeof initialEnergy === "undefined") { initialEnergy = 0; }
    }
    BigSelfPoweredConstantDirectionEngine.prototype.attachTo = function (body) {
        this.attachedBody = body;
        body.engines = body.engines || [this];
    };

    BigSelfPoweredConstantDirectionEngine.prototype.applyForce = function (timeInterval) {
        if (this.attachedBody) {
            var initialKineticEnergy = Physics.Current.lawOfConservationOfEnergy.kineticEnergy(this.attachedBody);
            this.attachedBody.applyForce(this.force, timeInterval);
            var energyUsed = Physics.Current.lawOfConservationOfEnergy.kineticEnergy(this.attachedBody) - initialKineticEnergy;
            this.energyStored -= energyUsed;
        }
    };
    return BigSelfPoweredConstantDirectionEngine;
})();

var Physics = (function () {
    function Physics() {
        this.forceFields = [];
        this.principleOfInertia = {
            apply: function (bodies, timeInterval) {
                bodies.forEach(function (unforcedBody) {
                    unforcedBody.moveBy(unforcedBody.momentum.timesScalar(timeInterval / unforcedBody.mass));
                });
            },
            invariant: function (universe) {
                return Vector3.sum(universe.bodies.map(function (b) {
                    return b.momentum;
                }));
            }
        };
        this.lawOfConservationOfEnergy = {
            apply: function (bodies, timeInterval) {
                _.filter(bodies, function (body) {
                    return body.engines != undefined;
                }).forEach(function (body) {
                    (body.engines).forEach(function (engine) {
                        engine.applyForce(timeInterval);
                    });
                });
            },
            invariant: function (universe) {
                return _.sum(universe.bodies.map(function (body) {
                    var sumOfEnergyInAttachedEngines = body.engines ? _.sum((body.engines).map(function (e) {
                        return e.energyStored;
                    })) : 0;
                    return this.lawOfConservationOfEnergy.kineticEnergy(body) + sumOfEnergyInAttachedEngines + universe.entropy;
                }));
            },
            kineticEnergy: function (body) {
                return body.momentum.magnitudeSquared() / body.mass / 2;
            }
        };
        this.timeInvariants = [this.principleOfInertia, this.lawOfConservationOfEnergy];
    }
    Physics.Current = new Physics();
    return Physics;
})();

function ReferenceFrame(bodies, physics) {
    var physics = physics || Physics.Current;
    bodies.forEach(function (b) {
        b.moveBy = bodyRoot.moveBy;
        b.velocity = bodyRoot.velocity;
        b.applyForce = bodyRoot.applyForce;
    });
    this.universe = new Universe(bodies, physics);
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
//# sourceMappingURL=fiziksEndion.js.map
