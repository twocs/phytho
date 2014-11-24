// shouldnt be a global :(
var particleColors = [
        new b2ParticleColor(0xff, 0x00, 0x00, 0xff), // red
        new b2ParticleColor(0x00, 0xff, 0x00, 0xff), // green
        new b2ParticleColor(0x00, 0x00, 0xff, 0xff), // blue
        new b2ParticleColor(0xff, 0x8c, 0x00, 0xff), // orange
        new b2ParticleColor(0x00, 0xce, 0xd1, 0xff), // turquoise
        new b2ParticleColor(0xff, 0x00, 0xff, 0xff), // magenta
        new b2ParticleColor(0xff, 0xd7, 0x00, 0xff), // gold
        new b2ParticleColor(0x00, 0xff, 0xff, 0xff) // cyan
    ];
var container;
var world = null;
var threeRenderer;
var renderer;
var camera;
var scene;
var objects = [];
var timeStep = 1.0 / 60.0;
var velocityIterations = 8;
var positionIterations = 3;
var test = {};
var projector = new THREE.Projector();
var g_groundBody = null;

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

function printErrorMsg(msg) {
  var domElement = document.createElement('div');
  domElement.style.textAlign = 'center';
  domElement.innerHTML = msg;
  document.body.appendChild(domElement);
}

function initTestbed() {
  camera = new THREE.PerspectiveCamera(70
    , windowWidth / windowHeight
    , 1, 1000);

  try {
    threeRenderer = new THREE.WebGLRenderer();
  } catch( error ) {
    printErrorMsg('<p>Sorry, your browser does not support WebGL.</p>'
                + '<p>This testbed application uses WebGL to quickly draw'
                + ' LiquidFun particles.</p>'
                + '<p>LiquidFun can be used without WebGL, but unfortunately'
                + ' this testbed cannot.</p>'
                + '<p>Have a great day!</p>');
    return;
  }

  threeRenderer.setClearColor(0xEEEEEE);
  threeRenderer.setSize(windowWidth, windowHeight);

  scene = new THREE.Scene();

  document.body.appendChild( this.threeRenderer.domElement);

  this.mouseJoint = null;

  // hack
  renderer = new Renderer();
  
  gravity = new b2Vec2(0, -10);
  world = new b2World(gravity);
    
  Testbed();
}

function testSwitch(testName) {
  ResetWorld();
  world.SetGravity(new b2Vec2(0, -10));
  var bd = new b2BodyDef;
  g_groundBody = world.CreateBody(bd);
  test = new window[testName];
}

function Testbed(obj) {
  // Init world
  //GenerateOffsets();
  //Init
  var that = this;
  document.addEventListener('keypress', function(event) {
    if (test.Keyboard !== undefined) {
      test.Keyboard(String.fromCharCode(event.which) );
    }
  });
  document.addEventListener('keyup', function(event) {
    if (test.KeyboardUp !== undefined) {
      test.KeyboardUp(String.fromCharCode(event.which) );
    }
  });

  document.addEventListener('mousedown', function(event) {
    var p = getMouseCoords(event);
    var aabb = new b2AABB;
    var d = new b2Vec2;

    d.Set(0.01, 0.01);
    b2Vec2.Sub(aabb.lowerBound, p, d);
    b2Vec2.Add(aabb.upperBound, p, d);

    var queryCallback = new QueryCallback(p);
    world.QueryAABB(queryCallback, aabb);

    if (queryCallback.fixture) {
      var body = queryCallback.fixture.body;
      var md = new b2MouseJointDef;
      md.bodyA = g_groundBody;
      md.bodyB = body;
      md.target = p;
      md.maxForce = 1000 * body.GetMass();
      that.mouseJoint = world.CreateJoint(md);
      body.SetAwake(true);
    }
    if (test.MouseDown !== undefined) {
      test.MouseDown(p);
    }

  });

  document.addEventListener('mousemove', function(event) {
    var p = getMouseCoords(event);
    if (that.mouseJoint) {
      that.mouseJoint.SetTarget(p);
    }
    if (test.MouseMove !== undefined) {
      test.MouseMove(p);
    }
  });

  document.addEventListener('mouseup', function(event) {
    if (that.mouseJoint) {
      world.DestroyJoint(that.mouseJoint);
      that.mouseJoint = null;
    }
    if (test.MouseUp !== undefined) {
      test.MouseUp(getMouseCoords(event));
    }
  });


  window.addEventListener( 'resize', onWindowResize, false );

  testSwitch("TestWaveMachine");

  render();
}

var render = function() {
  // bring objects into world
  renderer.currentVertex = 0;
  if (test.Step !== undefined) {
    test.Step();
  } else {
    Step();
  }
  renderer.draw();

  threeRenderer.render(scene, camera);
  requestAnimationFrame(render);
};

var ResetWorld = function() {
  if (world !== null) {
    while (world.joints.length > 0) {
      world.DestroyJoint(world.joints[0]);
    }

    while (world.bodies.length > 0) {
      world.DestroyBody(world.bodies[0]);
    }

    while (world.particleSystems.length > 0) {
      world.DestroyParticleSystem(world.particleSystems[0]);
    }
  }
};

var Step = function() {
  world.Step(timeStep, velocityIterations, positionIterations);
};

/**@constructor*/
function QueryCallback(point) {
  this.point = point;
  this.fixture = null;
}

/**@return bool*/
QueryCallback.prototype.ReportFixture = function(fixture) {
  var body = fixture.body;
  if (body.GetType() === b2_dynamicBody) {
    var inside = fixture.TestPoint(this.point);
    if (inside) {
      this.fixture = fixture;
      return true;
    }
  }
  return false;
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  threeRenderer.setSize( window.innerWidth, window.innerHeight );
}

function getMouseCoords(event) {
  var mouse = new THREE.Vector3();
  mouse.x = (event.clientX / windowWidth) * 2 - 1;
  mouse.y = -(event.clientY / windowHeight) * 2 + 1;
  mouse.z = 0.5;

  projector.unprojectVector(mouse, camera);
  var dir = mouse.sub(camera.position).normalize();
  var distance = -camera.position.z / dir.z;
  var pos = camera.position.clone().add(dir.multiplyScalar(distance));
  var p = new b2Vec2(pos.x, pos.y);
  return p;
}

function setupBoxes() {
    "use strict";
    self.box5 = new b2PolygonShape();
    self.box5.angle = Math.acos(4 / 5);
    self.box5.sidelength = 3 * 0.5;
    var xshift = self.box5.sidelength / 2 * Math.sin(self.box5.angle);
    var yshift = -1 * self.box5.sidelength /2 * Math.cos(self.box5.angle);
    self.box5.center = new b2Vec2(xshift, yshift);
    self.box5.SetAsBoxXYCenterAngle(
        self.box5.sidelength / 2, 
        self.box5.sidelength / 2, 
        self.box5.center, 
        self.box5.angle
    ); // why do we use the different boxes, not the same box?
    
    // center of the hypotenuse
    self.center = new b2Vec2(
        (self.box5.vertices[2].x + self.box5.vertices[3].x)/ 2,
        (self.box5.vertices[2].y + self.box5.vertices[3].y)/ 2
    );

    self.box4 = new b2PolygonShape();  
    self.box4.sidelength = 3 * 0.4;
    self.box4.center = new b2Vec2(
            self.box5.vertices[2].x - self.box4.sidelength/2, 
            self.box5.vertices[2].y + self.box4.sidelength/2
        );
    self.box4.SetAsBoxXYCenterAngle(
        self.box4.sidelength/2, 
        self.box4.sidelength/2, 
        self.box4.center, 
        0
    );
    
    self.box3 = new b2PolygonShape();
    self.box3.sidelength = 3 * 0.3;
    self.box3.center = new b2Vec2(
            self.box5.vertices[3].x - self.box3.sidelength/2, 
            self.box5.vertices[3].y + self.box3.sidelength/2
        );
    self.box3.SetAsBoxXYCenterAngle(
        self.box3.sidelength/2, 
        self.box3.sidelength/2, 
        self.box3.center, 
        0
    );
}

function TestWaveMachine() {
    "use strict";
    
    setupBoxes();
    
    self.camera.position.x = self.center.x;
    self.camera.position.y = self.center.y;
    self.camera.position.z = 5;

    scene.position.x = self.center.x;
    scene.position.y = self.center.y;
    
    camera.lookAt(scene.position);
    
    var bd = new b2BodyDef(),
        ground = self.world.CreateBody(bd);

    bd.type = b2_dynamicBody;
    bd.allowSleep = false;
    bd.position.Set(self.center.x, self.center.y);

    var body = world.CreateBody(bd);

    //body.CreateFixtureFromShape(self.box5, 55);
    //body.CreateFixtureFromShape(self.box4, 55);
    //body.CreateFixtureFromShape(self.box3, 55);
    
    var junk = new b2PolygonShape();
    junk.SetAsBoxXYCenterAngle(0.1, 0.1, new b2Vec2(self.box4.center.x - 0.1,self.box3.center.y + 0.1), 0);
    body.CreateFixtureFromShape(junk,5);
    
    // BOX 5
    var box5_0 = new b2EdgeShape();
    box5_0.Set(self.box5.vertices[0], self.box5.vertices[1]);
    body.CreateFixtureFromShape(box5_0, 55);
    
    var box5_1 = new b2EdgeShape();
    box5_1.Set(self.box5.vertices[1], self.box5.vertices[2]);
    body.CreateFixtureFromShape(box5_1, 55);
    
    var box5_2 = new b2EdgeShape();
    box5_2.Set(self.box5.vertices[3], self.box5.vertices[0]);
    body.CreateFixtureFromShape(box5_2, 55);
    
    var box5_S = new b2EdgeShape();
    
    var gap = 0.15;
    var gap_inv = 1 - gap;
    
    box5_S.Set(
        new b2Vec2(
            self.box5.vertices[2].x * gap_inv + self.box5.vertices[3].x * gap,
            self.box5.vertices[2].y * gap_inv + self.box5.vertices[3].y * gap
        ),
        new b2Vec2(
            self.box5.vertices[2].x * gap + self.box5.vertices[3].x * gap_inv,
            self.box5.vertices[2].y * gap + self.box5.vertices[3].y * gap_inv
        )
    );
    body.CreateFixtureFromShape(box5_S, 55);
    
    
    // BOX 4
    box4._0 = new b2EdgeShape();
    box4._0.Set(self.box4.vertices[1], self.box4.vertices[2]);
    body.CreateFixtureFromShape(box4._0, 55);
    
    box4._1 = new b2EdgeShape();
    box4._1.Set(self.box4.vertices[2], self.box4.vertices[3]);
    body.CreateFixtureFromShape(box4._1, 55);
    
    box4._2 = new b2EdgeShape();
    box4._2.Set(self.box4.vertices[3], self.box4.vertices[0]);
    body.CreateFixtureFromShape(box4._2, 55);

    box4._S = new b2EdgeShape();
    box4._S.Set(
        new b2Vec2(
            self.box4.vertices[0].x * gap_inv + self.box4.vertices[1].x * gap,
            self.box4.vertices[0].y * gap_inv + self.box4.vertices[1].y * gap
        ),
        new b2Vec2(
            self.box4.vertices[0].x * gap + self.box4.vertices[1].x * gap_inv,
            self.box4.vertices[0].y * gap + self.box4.vertices[1].y * gap_inv
        )
    );
    body.CreateFixtureFromShape(box4._S, 55);
    
    
    // BOX 3
    var box3_0 = new b2EdgeShape();
    box3_0.Set(self.box3.vertices[0], self.box3.vertices[1]);
    body.CreateFixtureFromShape(box3_0, 55);
    
    var box3_1 = new b2EdgeShape();
    box3_1.Set(self.box3.vertices[2], self.box3.vertices[3]);
    body.CreateFixtureFromShape(box3_1, 55);
    
    var box3_2 = new b2EdgeShape();
    box3_2.Set(self.box3.vertices[3], self.box3.vertices[0]);
    body.CreateFixtureFromShape(box3_2, 55);
    
    var box3_S = new b2EdgeShape();
    box3_S.Set(
        new b2Vec2(
            self.box3.vertices[2].x * gap_inv + self.box3.vertices[1].x * gap,
            self.box3.vertices[2].y * gap_inv + self.box3.vertices[1].y * gap
        ),
        new b2Vec2(
            self.box3.vertices[2].x * gap + self.box3.vertices[1].x * gap_inv,
            self.box3.vertices[2].y * gap + self.box3.vertices[1].y * gap_inv
        )
    );
    body.CreateFixtureFromShape(box3_S, 55);
    
    
    // INTERSTITIALS
    
    var box34_S = new b2EdgeShape();
    box34_S.Set(
        box3_S.vertex1,
        box4._S.vertex1
    );
    body.CreateFixtureFromShape(box34_S, 55);
    
    var box35_S = new b2EdgeShape();
    box35_S.Set(
        box3_S.vertex2,
        box5_S.vertex2
    );
    body.CreateFixtureFromShape(box35_S, 55);
    
    var box45_S = new b2EdgeShape();
    box45_S.Set(
        box4._S.vertex2,
        box5_S.vertex1
    );
    body.CreateFixtureFromShape(box45_S, 55);
    
    
    // MOTOR

    var jd = new b2RevoluteJointDef();
    jd.motorSpeed = 0;//0.05 * Math.PI;
    jd.maxMotorTorque = 1e22; //1e7;
    jd.enableMotor = true;
    this.joint = jd.InitializeAndCreate(
        ground, 
        body, 
        new b2Vec2(self.center.x, self.center.y)
    );
    this.time = 0;

    // PARTICLES
    
    var psd = new b2ParticleSystemDef();
    psd.radius = 0.025;
    psd.dampingStrength = 0.9;//0.4;

    var particleSystem = world.CreateParticleSystem(psd);
    
    var box_ps1 = new b2PolygonShape();
    box_ps1.SetAsBoxXYCenterAngle(0.499 * box4.sidelength, 0.499 * box4.sidelength, box4.center, 0);

    
    var particleGroupDef_1 = new b2ParticleGroupDef();
    particleGroupDef_1.shape = box_ps1;
    particleGroupDef_1.flags = b2_staticPressureParticle ;//| b2_tensileParticle;
    particleGroupDef_1.color = new b2ParticleColor(0, 0, 255, 255);
    
    particleSystem.CreateParticleGroup(particleGroupDef_1);
    
    var box_ps2 = new b2PolygonShape();
    box_ps2.SetAsBoxXYCenterAngle(0.499 * box3.sidelength, 0.499 * box3.sidelength, box3.center, 0);

    var particleGroupDef_2 = new b2ParticleGroupDef();
    particleGroupDef_2.shape = box_ps2;
    particleGroupDef_2.flags = b2_staticPressureParticle ;//| b2_tensileParticle;
    particleGroupDef_2.color = new b2ParticleColor(10, 10, 200, 255);
    particleSystem.CreateParticleGroup(particleGroupDef_2);


    // extra fill is determined by guessing, so it looks like 0.2 is too much but 0.16 is not enough, maybe it varies by device?
    
    var box_ps3 = new b2PolygonShape();
    box_ps3.SetAsBoxXYCenterAngle(0.15 * box5.sidelength, 0.16 * box5.sidelength, box5.center, box5.angle);

    var particleGroupDef_3 = new b2ParticleGroupDef();
    particleGroupDef_3.shape = box_ps3;
    particleGroupDef_3.flags = b2_staticPressureParticle ;//| b2_tensileParticle;
    particleGroupDef_3.color = new b2ParticleColor(100, 150, 200, 255);   
    particleSystem.CreateParticleGroup(particleGroupDef_3);

    window.addEventListener("devicemotion", deviceMotionHandler);
}

TestWaveMachine.prototype.Step = function() {
    world.Step(timeStep, velocityIterations, positionIterations);
    this.time += 1 / 60;
    this.joint.SetMotorSpeed(0.0);//(0.05 * Math.cos(this.time) * Math.PI);
}

function deviceMotionHandler(event) {
  if(!event.accelerationIncludingGravity.x)return;
  var x = -event.accelerationIncludingGravity.x, y = -event.accelerationIncludingGravity.y;
  console.log(x + ", " + y);
  window.gravity.Set(x, y); 
  window.world.SetGravity(window.gravity); 
}
