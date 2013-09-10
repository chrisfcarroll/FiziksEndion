/// <reference path="lib/underscore-typed.d.ts" />
/**
 * @module FiziksEndion. A simple javascript physics engine.
 */
module FiziksEndion {

  _.sum = function (list) {
    return _.reduce(list, function (sumSoFar, nextValue) {
      return sumSoFar + nextValue;
    }, 0);
  };

  /**
   * @class Vector3 : 3-d vectors of numbers.
   * Statically typed with functions for basic maths operations.
   * Instances of Vector3 are intended to be immutable, so operations return new instances.
   */
  export class Vector3 {
    constructor(public x:number, public y:number, public z:number) {
    }
    magnitudeSquared() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    magnitude() {
      return Math.sqrt(this.magnitudeSquared());
    }
    direction() {
      var size = this.magnitude();
      return new Vector3(this.x / size, this.y / size, this.z / size);
    }
    timesScalar(scalar:number) {
      return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
    add(right) {
      return new Vector3(this.x + right.x, this.y + right.y, this.z + right.z);
    }

    /**
     * The zero vector is Vector3(0,0,0);
     */
    static zero = new Vector3(0, 0, 0);

    static sum = function (arrayOfVector3s:Vector3[]) {
      var totalx = 0, totaly = 0, totalz = 0;
      arrayOfVector3s.forEach(function (el) {
        totalx += el.x;
        totaly += el.y;
        totalz += el.z;
      });
      return new Vector3(totalx, totaly, totalz);
    };

  }

  /*
   * Represents a body as seen from a reference frame
   */
  export interface Body {
    mass : number;
    location : Vector3;
    momentum: Vector3;
    velocity() : Vector3;
    moveBy(vector:Vector3);
    applyForce(force:Vector3, timeInterval:number);
  }

  /**
   * A prototype for creating new instances which implement interface Body.
   * Helper functions wrap() and augment() turn an existing object into a Body by (respectively)
   * augmenting it with the required missing functions or putting it in a wrapper.
   */
  export var Body = {
    momentum: Vector3.zero,

    velocity: function ():Vector3 {
      return this.momentum.timesScalar(1.0 / this.mass);
    },

    moveBy: function (vector:Vector3) {
      this.location = this.location.add(vector);
    },

    applyForce: function (force:Vector3, timeInterval:number) {
      this.moveBy(force.timesScalar(timeInterval * timeInterval / this.mass / 2));
      this.momentum = this.momentum.add(force.timesScalar(timeInterval));
    },

    /**
     * wrap an object so it can be treated as a Body in the physics engine.
     * The object to be wrapped must already a mass defined, or a value must be provided.
     */
    wrap : function(objectAsBody, mass? : number, location?:Vector3, momentum?:Vector3){
      var massBackingField = mass;
      var getMassBackingFn= mass ? function(){return massBackingField;}
                                 : function(){return objectAsBody.mass;};
      var setMassBackingFn= mass ? function(m){massBackingField=m;}
                                 : function(m){objectAsBody.mass=m;};

      var wrapper: Body = Object.create(this);
      Object.defineProperties(wrapper, {
        get mass() : number { return getMassBackingFn()},
        set mass(m:number)  { setMassBackingFn(m);},
        location : location,
        momentum : momentum,
        velocity : Body.velocity,
        moveBy   : Body.moveBy,
        applyForce : Body.applyForce
      });
      return wrapper;
    },

    /**
     * Makes an object implement Body by augmenting it with the necessary methods.
     * @param object : Must already have properties mass and location.
     */
   augment : function(object, mass? : number, location? : Vector3, momentum? : Vector3){
      if(mass){
        object.mass=mass;
      }else if (object.mass === undefined){
        throw { error : "object must have a mass to be used as a body." };
      }

      if(location){
        object.location=location;
      }else if(object.location === undefined){
       throw { error : "object must have a location to be used as a body." };
     }

     if(momentum){
       object.momentum= momentum;
     }else if (object.momentum === undefined){
       object.momentum= Vector3.zero;
     }

     if (object.moveBy !== undefined && object.moveBy !== this.moveBy) {
        throw {message: "moveBy is already defined but not as FiziksEndion.Body.moveBy"};
      }
     object.moveBy = Body.moveBy;
     object.velocity = Body.velocity;
     object.applyForce = Body.applyForce;
     return object;
   }
  };

  export class Universe {
    constructor(public bodies:Body[], private _physics:Physics = Physics.Current, public entropy:number = 0) {
    }

    public totalMomentum() {
      return this._physics.principleOfInertia.invariant(this);
    }

    public totalKineticEnergy() {
      return this._physics.lawOfConservationOfEnergy.invariant(this);
    }
  }

  export interface Engine {
    attachedBody : Body;
    energyStored : number;
    force: Vector3;
    applyForce(timeInterval:number);
  }

  export class BigSelfPoweredConstantDirectionEngine {
    attachedBody:Body;
    energyStored:number;
    force:Vector3;

    constructor(force:Vector3 = Vector3.zero, initialEnergy:number = 0) {
    }

    attachTo(body) {
      this.attachedBody = body;
      body.engines = body.engines || [this];
    }

    applyForce(timeInterval) {
      if (this.attachedBody) {
        var initialKineticEnergy = Physics.Current.lawOfConservationOfEnergy.kineticEnergy(this.attachedBody);
        this.attachedBody.applyForce(this.force, timeInterval);
        var energyUsed = Physics.Current.lawOfConservationOfEnergy.kineticEnergy(this.attachedBody) - initialKineticEnergy;
        this.energyStored -= energyUsed;
      }
    }
  }

  export class Physics {

    static Current = new Physics();

    forceFields = [];

    principleOfInertia = {
      apply: function (bodies, timeInterval) {
        bodies.forEach(function (unforcedBody) {
          unforcedBody.moveBy(unforcedBody.momentum.timesScalar(timeInterval / unforcedBody.mass));
        });
      },

      invariant: function (universe:Universe) {
        return Vector3.sum(universe.bodies.map(b=>b.momentum));
      }

    };

    lawOfConservationOfEnergy = {
      apply: function (bodies, timeInterval) {
        _.filter(bodies, function (body) {
          return body.engines != undefined;
        })
          .forEach(function (body) {
            (<Engine[]>body.engines).forEach(function (engine) {
              engine.applyForce(timeInterval);
            });
          });
      },

      invariant: function (universe:Universe) {
        return _.sum(universe.bodies.map(function (body) {
          var sumOfEnergyInAttachedEngines = body.engines
            ? _.sum((<Engine[]>body.engines).map(function (e) {
            return e.energyStored;
          }))
            : 0;
          return this.lawOfConservationOfEnergy.kineticEnergy(body) + sumOfEnergyInAttachedEngines + universe.entropy;
        }));
      },

      kineticEnergy: function (body) {
        return body.momentum.magnitudeSquared() / body.mass / 2;
      }
    };

    timeInvariants = [ this.principleOfInertia, this.lawOfConservationOfEnergy ];
  }

  export function ReferenceFrame(bodies, physics) {
    var physics = physics || Physics.Current;
    bodies.forEach(b=> { Body.augment(b); });
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
}
