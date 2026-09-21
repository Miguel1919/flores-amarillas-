(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var mensajes = [
    "Desde que empezamos a hablar siento que el tiempo camina distinto, como si cada día fuera un paso hacia algo bonito que apenas estamos empezando a construir.",
    "Me gusta pensar que en algún rincón del universo existe de verdad un lugar como este, lleno de flores que solo florecen cuando alguien piensa en la persona que quiere.",
    "Reírme contigo se volvió mi parte favorita del día, y se me olvida el tiempo por completo cuando hablamos, así sea de nada.",
    "Hice este viajecito para decirte que contigo todo se siente como llegar a un lugar nuevo y sentir que ya lo conocía.",
    "Cada estrella de este universo es un motivo distinto por el que me gustas, y todavía me faltan estrellas por poner.",
    "Si pudiera llevarte a un solo lugar del espacio sería a este, porque aquí todo brilla como brillas tú cuando te ríes.",
    "Gracias por aparecer sin avisar y quedarte, esta espiral entera existe porque quería que lo supieras.",
    "Todavía no sé cómo explicar lo que siento, así que mejor te construí un universo para que lo veas en vez de leerlo."
  ];

  var escena = new THREE.Scene();
  var camara = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 6000);
  camara.position.set(0,0,0);

  var renderer = new THREE.WebGLRenderer({antialias:true, alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x03000f, 1);
  document.getElementById('escenaTres').appendChild(renderer.domElement);

  window.addEventListener('resize', function(){
    camara.aspect = window.innerWidth/window.innerHeight;
    camara.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- estrellas ambientales fijas, rodean toda la escena ---
  function crearCampoEstrellas(cantidad, radioMin, radioMax, tamano, color){
    var pos = new Float32Array(cantidad*3);
    for(var i=0;i<cantidad;i++){
      var r = radioMin + Math.random()*(radioMax-radioMin);
      var th = Math.random()*Math.PI*2;
      var ph = Math.acos((Math.random()*2)-1);
      pos[i*3] = r*Math.sin(ph)*Math.cos(th);
      pos[i*3+1] = r*Math.cos(ph);
      pos[i*3+2] = -600 + r*Math.sin(ph)*Math.sin(th);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    var mat = new THREE.PointsMaterial({color:color, size:tamano, sizeAttenuation:true, transparent:true, opacity:1, blending:THREE.AdditiveBlending, depthWrite:false});
    return new THREE.Points(geo, mat);
  }
  escena.add(crearCampoEstrellas(6000, 200, 2400, 2.4, 0xfff4d0));
  escena.add(crearCampoEstrellas(3200, 200, 2400, 4.6, 0xffd23f));
  escena.add(crearCampoEstrellas(900, 250, 2200, 9, 0xfffce6));

  // --- estrellas de viaje (efecto warp) ---
  var totalWarp = reduceMotion ? 0 : 900;
  var warpGeo = new THREE.BufferGeometry();
  var warpPos = new Float32Array(totalWarp*3*2);
  var warpData = [];
  function nacerWarp(s){
    var ang = Math.random()*Math.PI*2;
    var rad = 20 + Math.random()*260;
    s.x = Math.cos(ang)*rad;
    s.y = Math.sin(ang)*rad;
    s.z = -Math.random()*2400 - 100;
  }
  for(var i=0;i<totalWarp;i++){
    var s = {x:0,y:0,z:0,pz:0};
    nacerWarp(s);
    s.pz = s.z;
    warpData.push(s);
  }
  warpGeo.setAttribute('position', new THREE.BufferAttribute(warpPos,3));
  var warpMat = new THREE.LineBasicMaterial({color:0xffe9a8, transparent:true, opacity:0.85});
  var warpLineas = new THREE.LineSegments(warpGeo, warpMat);
  escena.add(warpLineas);

  // --- grupo galaxia (espiral + flores + corazon) ---
  var galaxia = new THREE.Group();
  var zLejos = -2600;
  var zCerca = -460;
  galaxia.position.set(0,0,zLejos);
  galaxia.scale.setScalar(0.15);
  escena.add(galaxia);

  function colorEspiral(fraccion){
    var centro = new THREE.Color(0xfff6d8);
    var borde = new THREE.Color(0xc97a12);
    return centro.clone().lerp(borde, fraccion);
  }

  // polvo de la espiral
  var brazos = 4;
  var puntosPorBrazo = 1700;
  var radioMaxEspiral = 300;
  var totalEspiral = brazos*puntosPorBrazo;
  var espiralPos = new Float32Array(totalEspiral*3);
  var espiralColor = new Float32Array(totalEspiral*3);
  var idx = 0;
  for(var b=0;b<brazos;b++){
    for(var i=0;i<puntosPorBrazo;i++){
      var t = i/puntosPorBrazo;
      var angulo = t*Math.PI*6.8 + b*(Math.PI*2/brazos);
      var radio = 18 + t*radioMaxEspiral + (Math.random()-0.5)*8;
      var jitter = (Math.random()-0.5)*(5+t*9);
      var x = Math.cos(angulo)*radio + jitter;
      var z = Math.sin(angulo)*radio + jitter;
      var y = (Math.random()-0.5)*7*(1-t*0.4);
      espiralPos[idx*3] = x;
      espiralPos[idx*3+1] = y;
      espiralPos[idx*3+2] = z;
      var c = colorEspiral(t);
      espiralColor[idx*3] = c.r;
      espiralColor[idx*3+1] = c.g;
      espiralColor[idx*3+2] = c.b;
      idx++;
    }
  }
  var espiralGeo = new THREE.BufferGeometry();
  espiralGeo.setAttribute('position', new THREE.BufferAttribute(espiralPos,3));
  espiralGeo.setAttribute('color', new THREE.BufferAttribute(espiralColor,3));
  var espiralMat = new THREE.PointsMaterial({size:3.6, vertexColors:true, transparent:true, opacity:1, blending:THREE.AdditiveBlending, depthWrite:false});
  var espiralPuntos = new THREE.Points(espiralGeo, espiralMat);
  galaxia.add(espiralPuntos);

  // anillo de puntos amarillos extremadamente brillantes alrededor de la espiral
  var totalChispas = 1000;
  var chispasPos = new Float32Array(totalChispas*3);
  for(var ch=0; ch<totalChispas; ch++){
    var angCh = Math.random()*Math.PI*2;
    var radCh = radioMaxEspiral*0.5 + Math.random()*radioMaxEspiral*0.9;
    chispasPos[ch*3] = Math.cos(angCh)*radCh;
    chispasPos[ch*3+1] = (Math.random()-0.5)*90;
    chispasPos[ch*3+2] = Math.sin(angCh)*radCh;
  }
  var chispasGeo = new THREE.BufferGeometry();
  chispasGeo.setAttribute('position', new THREE.BufferAttribute(chispasPos,3));
  var chispasMat = new THREE.PointsMaterial({color:0xfffbe0, size:5.5, transparent:true, opacity:1, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true});
  var chispasPuntos = new THREE.Points(chispasGeo, chispasMat);
  galaxia.add(chispasPuntos);

  // nucleo brillante
  var nucleoGeo = new THREE.SphereGeometry(20, 24, 24);
  var nucleoMat = new THREE.MeshBasicMaterial({color:0xfff6d8, transparent:true, opacity:0.95});
  var nucleo = new THREE.Mesh(nucleoGeo, nucleoMat);
  galaxia.add(nucleo);

  // --- auroras amarillas alrededor de la espiral ---
  function texturaAurora(){
    var c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    var ctx = c.getContext('2d');
    for(var i=0;i<260;i++){
      var x = 128 + (Math.random()-0.5)*236;
      var y = 128 + (Math.random()-0.5)*236;
      var r = 5 + Math.random()*30;
      var dist = Math.min(1, Math.hypot(x-128,y-128)/128);
      var alfa = Math.max(0, (1-dist)) * (0.22 + Math.random()*0.45);
      var grad = ctx.createRadialGradient(x,y,0,x,y,r);
      grad.addColorStop(0, 'rgba(255,238,0,'+alfa+')');
      grad.addColorStop(0.6, 'rgba(255,214,0,'+(alfa*0.6)+')');
      grad.addColorStop(1, 'rgba(255,214,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(c);
  }
  var texAurora = texturaAurora();
  var auroras = [];
  function crearAurora(radio, anguloBase, alto, opacidad, contenedor, altoY){
    var geo = new THREE.PlaneGeometry(560, alto, 36, 1);
    var mat = new THREE.MeshBasicMaterial({map:texAurora, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide, opacity:opacidad});
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(Math.cos(anguloBase)*radio, altoY, Math.sin(anguloBase)*radio);
    mesh.rotation.y = anguloBase + Math.PI/2;
    mesh.userData.original = geo.attributes.position.array.slice();
    contenedor.add(mesh);
    auroras.push(mesh);
  }
  crearAurora(radioMaxEspiral*1.15, 0.2, 420, 0.9, galaxia, 60);
  crearAurora(radioMaxEspiral*1.2, 2.3, 380, 0.9, galaxia, 50);
  crearAurora(radioMaxEspiral*1.1, 4.4, 440, 0.9, galaxia, 62);

  // auroras amarillas tipo aerosol repartidas por todo el espacio
  for(var au=0; au<14; au++){
    var angAu = Math.random()*Math.PI*2;
    var radAu = 500 + Math.random()*1400;
    var altoAu = 340 + Math.random()*320;
    crearAurora(radAu, angAu, altoAu, 0.5 + Math.random()*0.25, escena, (Math.random()-0.5)*700);
  }

  // --- texturas de flores dibujadas en canvas, varios tipos ---
  function texturaMargarita(){
    var c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    var ctx = c.getContext('2d');
    ctx.translate(64,64);
    for(var k=0;k<6;k++){
      ctx.save();
      ctx.rotate(k*Math.PI/3);
      var grad = ctx.createRadialGradient(0,-26,2,0,-26,26);
      grad.addColorStop(0, '#fff6d8');
      grad.addColorStop(1, '#ffd23f');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0,-26,15,26,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
    var gradC = ctx.createRadialGradient(0,0,1,0,0,16);
    gradC.addColorStop(0,'#fff9e6');
    gradC.addColorStop(1,'#f2a900');
    ctx.fillStyle = gradC;
    ctx.beginPath();
    ctx.arc(0,0,15,0,Math.PI*2);
    ctx.fill();
    return new THREE.CanvasTexture(c);
  }

  function texturaTulipan(){
    var c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    var ctx = c.getContext('2d');
    ctx.translate(64,86);
    function petalo(rot){
      ctx.save();
      ctx.rotate(rot);
      var grad = ctx.createLinearGradient(0,-58,0,4);
      grad.addColorStop(0, '#fff3b0');
      grad.addColorStop(0.55, '#ffd23f');
      grad.addColorStop(1, '#e08a00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0,6);
      ctx.bezierCurveTo(-24,-8,-20,-44,0,-58);
      ctx.bezierCurveTo(20,-44,24,-8,0,6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(180,100,0,0.35)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
    }
    petalo(-0.36); petalo(0.36); petalo(0);
    return new THREE.CanvasTexture(c);
  }

  function texturaChispa(){
    var c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    var ctx = c.getContext('2d');
    ctx.translate(64,64);
    var grad = ctx.createRadialGradient(0,0,0,0,0,60);
    grad.addColorStop(0,'#fffdf2');
    grad.addColorStop(0.35,'#ffe27a');
    grad.addColorStop(1,'rgba(255,210,63,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0,-60); ctx.lineTo(14,-14); ctx.lineTo(60,0);
    ctx.lineTo(14,14); ctx.lineTo(0,60); ctx.lineTo(-14,14);
    ctx.lineTo(-60,0); ctx.lineTo(-14,-14); ctx.closePath();
    ctx.fill();
    return new THREE.CanvasTexture(c);
  }

  var texturasFlor = [texturaMargarita(), texturaTulipan(), texturaChispa()];

  function texturaTexto(mensaje, tamanoFuente){
    var c = document.createElement('canvas');
    c.width = 640; c.height = 200;
    var ctx = c.getContext('2d');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "italic 600 " + (tamanoFuente || 84) + "px 'Cormorant Garamond', Georgia, serif";
    ctx.shadowColor = 'rgba(255,214,92,0.95)';
    ctx.shadowBlur = 26;
    ctx.fillStyle = 'rgba(255,248,222,0.98)';
    ctx.fillText(mensaje, 320, 100);
    return new THREE.CanvasTexture(c);
  }

  var floresGrandes = [];
  function agregarFlor(x,z,y,tamano, esGrande, mensajeIdx, tipo){
    var mapa = texturasFlor[tipo || 0];
    var mat = new THREE.SpriteMaterial({map:mapa, transparent:true, depthWrite:false});
    var sprite = new THREE.Sprite(mat);
    sprite.position.set(x,y,z);
    sprite.scale.set(tamano, tamano, 1);
    sprite.userData.escalaFinal = tamano;
    sprite.userData.esGrande = !!esGrande;
    if(esGrande){
      sprite.userData.mensaje = mensajeIdx;
      floresGrandes.push(sprite);
    }
    sprite.scale.set(0,0,1);
    galaxia.add(sprite);
    return sprite;
  }

  var floresChicas = [];
  for(var b2=0;b2<brazos;b2++){
    for(var i2=0;i2<22;i2++){
      var t2 = 0.12 + (i2/22)*0.88;
      var ang2 = t2*Math.PI*6.8 + b2*(Math.PI*2/brazos) + (Math.random()-0.5)*0.35;
      var rad2 = 26 + t2*radioMaxEspiral;
      var x2 = Math.cos(ang2)*rad2;
      var z2 = Math.sin(ang2)*rad2;
      var y2 = (Math.random()-0.5)*12;
      var tipo2 = Math.floor(Math.random()*3);
      floresChicas.push(agregarFlor(x2,z2,y2, 16+Math.random()*12, false, 0, tipo2));
    }
  }
  var totalGrandes = 12;
  var vistazos = [
    "eres mi infinito",
    "eres mi amor eterno",
    "mi universo favorito",
    "brillas más que cualquier estrella",
    "contigo el tiempo se vuelve infinito",
    "eres mi galaxia entera",
    "el lugar al que siempre quiero volver",
    "mi constante en todo este universo",
    "la razón de este viaje",
    "más grande que cualquier espiral",
    "mi persona favorita del cosmos",
    "donde sea que esté, pienso en ti"
  ];
  var msgOrden = [];
  for(var g=0; g<totalGrandes; g++){
    var thetaG = Math.random()*Math.PI*2;
    var phiG = Math.PI*0.18 + Math.random()*(Math.PI*0.64);
    var radG = 190 + Math.random()*300;
    var xG = radG*Math.sin(phiG)*Math.cos(thetaG);
    var yG = radG*Math.cos(phiG);
    var zG = radG*Math.sin(phiG)*Math.sin(thetaG);
    var flor = agregarFlor(xG, zG, yG, 100, true, g%mensajes.length, 1);
    msgOrden.push(flor);
    var etiquetaMat = new THREE.SpriteMaterial({map:texturaTexto(vistazos[g], 60), transparent:true, depthWrite:false, opacity:0.95});
    var etiqueta = new THREE.Sprite(etiquetaMat);
    etiqueta.position.set(xG, yG+66, zG+6);
    etiqueta.scale.set(150, 47, 1);
    galaxia.add(etiqueta);
  }

  // --- todo el espacio invadido de flores amarillas ---
  var totalInvasoras = 220;
  for(var fi=0; fi<totalInvasoras; fi++){
    var rInv = 260 + Math.random()*1500;
    var thInv = Math.random()*Math.PI*2;
    var phInv = Math.acos((Math.random()*2)-1);
    var xInv = rInv*Math.sin(phInv)*Math.cos(thInv);
    var yInv = rInv*Math.cos(phInv);
    var zInv = -700 + rInv*Math.sin(phInv)*Math.sin(thInv);
    var tipoInv = Math.floor(Math.random()*3);
    var mapaInv = texturasFlor[tipoInv];
    var matInv = new THREE.SpriteMaterial({map:mapaInv, transparent:true, depthWrite:false, opacity:0.85});
    var sprInv = new THREE.Sprite(matInv);
    sprInv.position.set(xInv, yInv, zInv);
    var tamInv = 20 + Math.random()*30;
    sprInv.scale.set(tamInv, tamInv, 1);
    escena.add(sprInv);
  }

  // --- corazon de estrellas arriba del centro ---
  var puntosCorazon = [];
  var intentos = 0;
  while(puntosCorazon.length < 420 && intentos < 20000){
    intentos++;
    var px = (Math.random()*2.6)-1.3;
    var py = (Math.random()*2.4)-1.1;
    var val = Math.pow(px*px+py*py-1,3) - (px*px)*(py*py*py);
    if(val <= 0){
      puntosCorazon.push([px, py]);
    }
  }
  var corazonPos = new Float32Array(puntosCorazon.length*3);
  for(var h=0; h<puntosCorazon.length; h++){
    corazonPos[h*3] = puntosCorazon[h][0]*62;
    corazonPos[h*3+1] = puntosCorazon[h][1]*62 + 128;
    corazonPos[h*3+2] = (Math.random()-0.5)*16;
  }
  var corazonGeo = new THREE.BufferGeometry();
  corazonGeo.setAttribute('position', new THREE.BufferAttribute(corazonPos,3));
  var corazonMat = new THREE.PointsMaterial({color:0xffd23f, size:4.4, transparent:true, opacity:1, blending:THREE.AdditiveBlending, depthWrite:false});
  var corazonPuntos = new THREE.Points(corazonGeo, corazonMat);
  galaxia.add(corazonPuntos);

  // texto "Te amo" en el centro del corazon, mas grande que las flores con cartas
  var textoMat = new THREE.SpriteMaterial({map:texturaTexto('Te amo', 90), transparent:true, depthWrite:false});
  var textoSprite = new THREE.Sprite(textoMat);
  textoSprite.position.set(0, 128, 28);
  textoSprite.scale.set(260, 81, 1);
  galaxia.add(textoSprite);
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){
      textoMat.map = texturaTexto('Te amo', 90);
      textoMat.needsUpdate = true;
    });
  }

  // haz de estrellas que conecta el nucleo con el corazon
  var totalHaz = 130;
  var hazPos = new Float32Array(totalHaz*3);
  for(var hz=0; hz<totalHaz; hz++){
    hazPos[hz*3] = (Math.random()-0.5)*12;
    hazPos[hz*3+1] = 22 + Math.random()*106;
    hazPos[hz*3+2] = (Math.random()-0.5)*12;
  }
  var hazGeo = new THREE.BufferGeometry();
  hazGeo.setAttribute('position', new THREE.BufferAttribute(hazPos,3));
  var hazMat = new THREE.PointsMaterial({color:0xfff6d8, size:3, transparent:true, opacity:0.85, blending:THREE.AdditiveBlending, depthWrite:false});
  var hazPuntos = new THREE.Points(hazGeo, hazMat);
  galaxia.add(hazPuntos);

  // --- estado del viaje ---
  var FASE_INTRO = 0, FASE_VIAJE = 1, FASE_ORBITA = 2;
  var fase = FASE_INTRO;
  var tiempoInicioViaje = 0;
  var duracionViaje = reduceMotion ? 100 : 4600;

  var reloj = new THREE.Clock();

  function easeInOutCubic(t){
    return t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
  }

  document.getElementById('botonViaje').addEventListener('click', function(){
    document.getElementById('introOverlay').classList.add('oculto');
    document.getElementById('textoViaje').classList.add('visible');
    fase = FASE_VIAJE;
    tiempoInicioViaje = reloj.getElapsedTime();
    var musicaFondo = document.getElementById('musicaFondo');
    if(musicaFondo){
      musicaFondo.volume = 0.55;
      musicaFondo.play().catch(function(){});
    }
    if(reduceMotion){
      galaxia.position.set(0,0,zCerca);
      galaxia.scale.setScalar(1);
    }
  });

  // --- orbita de camara ---
  var objetivoOrbita = new THREE.Vector3(0,0,zCerca);
  var orbitRadio = 460, orbitMin = 220, orbitMax = 900;
  var orbitTheta = 0, orbitPhi = Math.PI/2;
  var arrastrando = false;
  var ultimoX = 0, ultimoY = 0;
  var inicioX = 0, inicioY = 0;
  var moviendoseMucho = false;

  function actualizarCamaraOrbita(){
    var x = objetivoOrbita.x + orbitRadio*Math.sin(orbitPhi)*Math.sin(orbitTheta);
    var y = objetivoOrbita.y + orbitRadio*Math.cos(orbitPhi);
    var z = objetivoOrbita.z + orbitRadio*Math.sin(orbitPhi)*Math.cos(orbitTheta);
    camara.position.set(x,y,z);
    camara.lookAt(objetivoOrbita);
  }

  var dom = renderer.domElement;
  dom.addEventListener('pointerdown', function(e){
    if(fase !== FASE_ORBITA) return;
    arrastrando = true;
    moviendoseMucho = false;
    ultimoX = inicioX = e.clientX;
    ultimoY = inicioY = e.clientY;
  });
  window.addEventListener('pointermove', function(e){
    if(!arrastrando) return;
    var dx = e.clientX - ultimoX;
    var dy = e.clientY - ultimoY;
    ultimoX = e.clientX; ultimoY = e.clientY;
    if(Math.abs(e.clientX-inicioX) + Math.abs(e.clientY-inicioY) > 6) moviendoseMucho = true;
    orbitTheta -= dx*0.0055;
    orbitPhi -= dy*0.0045;
    orbitPhi = Math.max(0.35, Math.min(Math.PI-0.35, orbitPhi));
  });
  window.addEventListener('pointerup', function(e){
    if(!arrastrando) return;
    arrastrando = false;
    if(!moviendoseMucho) intentarClicFlor(e.clientX, e.clientY);
  });
  dom.addEventListener('wheel', function(e){
    if(fase !== FASE_ORBITA) return;
    orbitRadio += e.deltaY*0.4;
    orbitRadio = Math.max(orbitMin, Math.min(orbitMax, orbitRadio));
  }, {passive:true});

  var rayo = new THREE.Raycaster();
  rayo.params.Sprite = rayo.params.Sprite || {};
  var puntero = new THREE.Vector2();
  var fondoModal = document.getElementById('fondoModal');
  var textoCarta = document.getElementById('textoCarta');

  function intentarClicFlor(cx, cy){
    puntero.x = (cx/window.innerWidth)*2-1;
    puntero.y = -(cy/window.innerHeight)*2+1;
    rayo.setFromCamera(puntero, camara);
    var hits = rayo.intersectObjects(floresGrandes);
    if(hits.length>0){
      var f = hits[0].object;
      textoCarta.textContent = mensajes[f.userData.mensaje];
      fondoModal.classList.add('activo');
    }
  }
  document.getElementById('cerrarCarta').addEventListener('click', function(){
    fondoModal.classList.remove('activo');
  });
  fondoModal.addEventListener('click', function(e){
    if(e.target === fondoModal) fondoModal.classList.remove('activo');
  });
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape') fondoModal.classList.remove('activo');
  });

  var tiempoLlegada = null;

  function animar(){
    requestAnimationFrame(animar);
    var t = reloj.getElapsedTime();

    // estrellas warp
    var posArr = warpGeo.attributes.position.array;
    var velocidad = fase===FASE_VIAJE ? 340 + 260*Math.min(1,(t-tiempoInicioViaje)/(duracionViaje/1000)) : (fase===FASE_INTRO ? 26 : 4);
    for(var i=0;i<warpData.length;i++){
      var s = warpData[i];
      s.pz = s.z;
      s.z += velocidad*0.016;
      if(s.z > 40){ nacerWarp(s); s.pz = s.z; }
      var base = i*6;
      posArr[base] = s.x; posArr[base+1] = s.y; posArr[base+2] = s.pz;
      posArr[base+3] = s.x; posArr[base+4] = s.y; posArr[base+5] = s.z;
    }
    warpGeo.attributes.position.needsUpdate = true;

    if(fase === FASE_VIAJE){
      var progreso = Math.min(1, (t - tiempoInicioViaje)/(duracionViaje/1000));
      var ease = easeInOutCubic(progreso);
      galaxia.position.z = THREE.MathUtils.lerp(zLejos, zCerca, ease);
      galaxia.scale.setScalar(THREE.MathUtils.lerp(0.15, 1, ease));
      if(progreso >= 1){
        fase = FASE_ORBITA;
        tiempoLlegada = t;
        objetivoOrbita.set(0,0,zCerca);
        document.getElementById('textoViaje').classList.remove('visible');
        document.getElementById('pistaGiro').classList.add('visible');
        setTimeout(function(){
          document.getElementById('pistaGiro').style.opacity = 0;
        }, 5200);
        floresGrandes.concat(floresChicas).forEach(function(f, i2){
          setTimeout(function(){
            var destino = f.userData.escalaFinal;
            var inicio = performance.now();
            function paso(){
              var pr = Math.min(1, (performance.now()-inicio)/500);
              var e2 = 1-Math.pow(1-pr,3);
              f.scale.set(destino*e2, destino*e2, 1);
              if(pr<1) requestAnimationFrame(paso);
            }
            paso();
          }, i2*35);
        });
      }
    }

    if(!reduceMotion){
      auroras.forEach(function(m, mi){
        var posAttr = m.geometry.attributes.position;
        var orig = m.userData.original;
        for(var vi=0; vi<posAttr.count; vi++){
          var ox = orig[vi*3], oz = orig[vi*3+2];
          posAttr.array[vi*3+2] = oz + Math.sin(t*1.1 + mi*2 + ox*0.018)*24;
        }
        posAttr.needsUpdate = true;
      });
    }

    if(fase === FASE_ORBITA){
      galaxia.rotation.y += 0.0009;
      actualizarCamaraOrbita();
      var pulso = 0.8 + Math.sin(t*2)*0.2;
      corazonMat.opacity = pulso;
      var flotar = Math.sin(t*0.8)*1.5;
      corazonPuntos.position.y = flotar;
      hazPuntos.position.y = flotar;
      textoSprite.position.y = 128 + flotar;
      chispasMat.opacity = 0.85 + Math.sin(t*3)*0.15;
    } else {
      camara.position.set(0,0,0);
      camara.lookAt(0,0,-1);
    }

    renderer.render(escena, camara);
  }
  animar();
})();
