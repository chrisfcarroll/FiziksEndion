/// <reference path="lib/underscore-typed.d.ts" />
/// <reference path="fiziksEndionVector.ts"/>

/**
 * @module FiziksEndion. A simple javascript physics engine.
 *
 * Basic usage: rf= new @ReferenceFrame([{mass:10,location: new Vector3(1,2,3), momentum: new Vector3(1,2,3)}, ...]);
 */
module FiziksEndion {

  /**
   * Represents a body as seen from a reference frame.
   * A body is the fundamental physical 'thing' that FiziksEndion moves around.
   */
  export interface Body {
    mass : number;
    location : Vector3;
    momentum: Vector3;
    velocity() : Vector3;
    moveBy(vector:Vector3);
  }

  /**
   * A prototype for creating new instances which implement interface Body.
   * Helper functions wrap() and augment() turn an existing object into a Body by, respectively,
   * augmenting it with the required missing functions,
   * wrapping it in an object having property get/setters which reference the wrapped object.
   */
  export var Body = {
    momentum: Vector3.zero,

    velocity: function ():Vector3 {
      return this.momentum.timesScalar(1.0 / this.mass);
    },

    moveBy: function (vector:Vector3) {
      this.location = this.location.add(vector);
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
        moveBy   : Body.moveBy
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
        throw { error : "object must have a mass, or you must specify one, to be used as a body." };
      }

      if(location){
        object.location=location;
      }else if(object.location === undefined){
       throw { error : "object must have a location, or you must specify one, to be used as a body." };
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
     return object;
   }
  };

  /**
   * An @Engine uses up @energyStored when its @force is applied to move a @Body
   * An engine must attachTo(aBody) in order to apply its force to it.
   */
  export interface Engine {
    attachedBody : Body;
    energyStored : number;
    force: Vector3;
    attachTo(body:Body):void;
  }

  /**
   * The simplest (and least realistic) engine: Applies a constant force, doesn't change direction
   * and contains its own energy store.
   */
  export class BigSelfPoweredConstantDirectionEngine {

    attachedBody:Body;

    constructor(public force:Vector3 = Vector3.zero, public energyStored:number = 0, private physics:Physics= FiziksEndion.defaultPhysics) {}

    attachTo(body) {
      this.attachedBody = body;
      body.engines = body.engines || [];
      body.engines.push(this);
    }
  }

  /**
   * Universes contain bodies, obey physics, and are wrapped by ReferenceFrames
   */
  export interface Universe {
    bodies : Body[];
    entropy: number;
    totalMomentum(): Vector3;
    totalKineticEnergy(): number;
  }

  class UniverseImpl implements Universe {
    constructor(public bodies:Body[], private _physics:Physics = defaultPhysics, public entropy:number = 0) {
    }

    public totalMomentum() {
      return this._physics.principleOfInertia.invariant(this);
    }

    public totalKineticEnergy() {
      return this._physics.kineticEnergy(this.bodies);
    }
  }

  export interface InvariantLaw<T>{
    apply(bodies: Body[], timeInterval:number) : void;
    invariant(universe:Universe) : T;
  }

  /**
   * Defines the laws of physics.
   * All physics are assumed to have the listed conservation laws, but have free reign as to what those
   * laws actually do.
   *
   * forceFields: Not yet implemented.
   * timeInvariants: the list of laws to apply as time passes. Typically expected to be exactly the
   * conservation laws.
   *
   */
  export interface Physics {
    forceFields : Object[];
    kineticEnergy(bodies:Body[]) : number;
    kineticEnergy(body:Body) : number;
    principleOfInertia : InvariantLaw<Vector3>;
    lawOfConservationOfEnergy : InvariantLaw<number>;
    timeInvariants : InvariantLaw<any>[];
  }

  /**
   * The example simple implement of a Physics. Doesn't yet deal with rotation. Or gravity ...
   */
  export var newtonianLinearMechanics : Physics = function(){
    var me = {

      forceFields : [],

        //public kineticEnergy(bodies:Body[])
        //public kineticEnergy(body:Body)
        kineticEnergy: function(b){
          if(b.momentum ){
            return b.momentum.magnitudeSquared() / b.mass / 2;
          }else{
            return _.sum(b.map(b => this.kineticEnergy(b)));
          }
        },

      principleOfInertia : {
        apply: function (bodies:Body[], timeInterval:number) : void {
          bodies.forEach(function (unforcedBody) {
            unforcedBody.moveBy(unforcedBody.momentum.timesScalar(timeInterval / unforcedBody.mass));
          });
        },

        invariant: function (universe: Universe) : Vector3 {
          return Vector3.sum(universe.bodies.map(b=>b.momentum));
        }
      },

      lawOfConservationOfEnergy : {

        apply: function (bodies:Body[], timeInterval:number) : void {
          _.filter(bodies, function (body) {
            return body.engines != undefined;
          })
            .forEach(function (body) {
              (<Engine[]>body.engines).forEach(function (engine) {

                var initialKineticEnergy = newtonianLinearMechanics.kineticEnergy(body);

                body.moveBy(engine.force.timesScalar(timeInterval * timeInterval / body.mass / 2));
                body.momentum = body.momentum.add(engine.force.timesScalar(timeInterval));

                var energyUsed = newtonianLinearMechanics.kineticEnergy(body) - initialKineticEnergy;
                engine.energyStored -= energyUsed;
              });
            });
        },

        invariant: function (universe:Universe) : number {

          var sumOfEnergyInAttachedEngines = _.sum(
            universe.bodies.map(
              body =>  body.engines ? _.sum( (<Engine[]>(body.engines)).map(e=>e.energyStored) )
                                    : 0
            ));

          return newtonianLinearMechanics.kineticEnergy(universe.bodies) + sumOfEnergyInAttachedEngines + universe.entropy;
        }
      },
      timeInvariants : [ ]
    };
    me.timeInvariants= [me.principleOfInertia, me.lawOfConservationOfEnergy];
    return me;
  }();

  /**
   * The default Physics for new Universes.
   */
  export var defaultPhysics= newtonianLinearMechanics;

  /**
   * All access to a universe is mediated via a ReferenceFrame.
   * Most notably, time passes for a ReferenceFrame, not a for a Universe.
   *
   * Observer is a synonym.
   */
  export function ReferenceFrame(bodies, physics) {

    bodies.forEach(b=> { Body.augment(b); });
    var physics = physics || FiziksEndion.defaultPhysics;
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
}
