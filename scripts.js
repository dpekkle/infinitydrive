/* 
- Backend -
- Add tick calculations to web worker for efficiency

~-------------- PLAN ----------------
You run into bosses. If you have enough velocity, they explode.

Eventually you reach bosses where the "first try" won't destroy them.

To get around this, you can go into foreman debt to buy drones, causing you to start travelling backwards (negative miners/s), 
then you will travel forward again at a greater speed.

The time (in turns) it will take to reach back where you started is:

-2*(minerpt)/foremanpt

Best way to do it would be to put a limit on the time you can take to travel backwards, allowing you to only go into debt by that much max. 
Should scale with based on networth.
*/

//~~~~ UI FUNCTIONS ~~~~
{
function checkVisibility()
{
	if (hiddenleft > 0)
	{
		switch(visiblemax - hiddenleft)
		{
			case 0:
				document.getElementById( "goldupgradebutton").style.visibility = "visible";
				hiddenleft--;
				break;
			case 1:
				if (Game.gold >= Game.minercost || Game.miner > 0)
				{
					document.getElementById("miners").style.visibility = "visible";
					document.getElementById("minerbutton").style.visibility = "visible";
					document.getElementById( "goldpt").style.visibility = "visible";
					document.getElementById("minerupgradebutton").style.visibility = "visible";
					hiddenleft--;
				}
				break;
			case 2:
				if (Game.miner >= Game.foremancost * 0.5 || Game.foreman > 0)
				{
					document.getElementById( "foremans").style.visibility = "visible";
					document.getElementById("foremanbutton").style.visibility = "visible";
					document.getElementById("minerspt").style.visibility = "visible";
					document.getElementById( "foremanupgradebutton").style.visibility = "visible";
					hiddenleft--;
				}	
				break;
			case 3:
				if (Game.foreman >= Game.shipcost * 0.5 || Game.ship > 0)
				{
					document.getElementById( "ships").style.visibility = "visible";
					document.getElementById("shipbutton").style.visibility = "visible";
					document.getElementById("foremanspt").style.visibility = "visible";		
					document.getElementById("shipupgradebutton").style.visibility = "visible";	
					document.getElementById("resetdrones").style.visibility = "visible";	
					hiddenleft--;	
				}	
				break;
			case 4:
				if (Game.droneclick == true)
					hiddenleft--;
				else if (Game.gold >= Game.droneclickcost * 0.5 && Game.droneclick == false)
				{
					createUpgrade(
					"droneclick", 
					"button", 
					"Drones click, costs " + formatNumber(Game.droneclickcost) + " " + Game.goldname, 
					"upgrade", 
					"Your visible drones (the amount you see, not the amount you own) will each click once per tick. The fuel earned from this doesn't increase your movement, just allows you to buy more things"
					);
					hiddenleft--;
					console.log("show ships");
				}
				break;
			case 5:
				if (Game.goldbuy !== 0)
					hiddenleft--;
				else if (Game.ship >= Game.goldbuycost * 0.5)
				{
					createUpgrade(
					"goldbuy", 
					"button", 
					"Buy units with" + Game.goldname + ", costs " + Game.goldbuycost + " " + Game.shipname, 
					"upgrade",
					"Will let you spend" + Game.goldname + " to buy"+ Game.shipname + ", best to leave this on as it increases the cost of using other units too"
					);
					hiddenleft--;
					console.log("show droneclick");
				}
				break;

			case 6:
				if (Game.clicktype == "miner")
					hiddenleft--;
				else if (Game.foreman >= Game.minerclickcost * 0.5)
				{
					createUpgrade(
					"minerclick", 
					"button", 
					"Clicks create" + Game.minername + ", costs " + formatNumber(Game.minerclickcost) + " " + Game.foremanname, 
					"upgrade", 
					"Each click grants 0.1 base" + Game.minername + ", multiplied by your click upgrade");
					hiddenleft--;
				}
				break;
			
			case 7:
				break;
		}
	}
}

/*
<input id = "goldbuy" type = "button" value = "Buy units with gold, costs 100 drones" onclick = "upgrade('goldbuy')" class = "upgrade"/>
<input id = "minerclick" type = "button" value = "Clicks also create 0.1 base miners, costs 10 B foremen" onclick = "upgrade('minerclick')" class = "upgrade"/></li>
<input id = "droneclick" type = "button" value = "Drones will click for you while online, costs 10 F gold" onclick = "upgrade('droneclick')" class = "upgrade"/></li>

*/

function updateAmounts()
{
	document.getElementById( "gold" ).value = formatNumber(Game.gold);	
	document.getElementById( "miners" ).value = formatNumber(Game.miner);	
	document.getElementById( "foremans" ).value = formatNumber(Game.foreman);
	document.getElementById( "ships" ).value = formatNumber(Game.ship);
	
	document.getElementById( "goldpt" ).value = formatNumber(tickspeed*Game.goldpt/gameslow) + " /sec";	
	document.getElementById( "minerspt" ).value = formatNumber(tickspeed*Game.minerpt/gameslow) + " /sec";	
	document.getElementById( "foremanspt" ).value = formatNumber(tickspeed*Game.foremanpt/gameslow) + " /sec";
	document.getElementById( "shipspt" ).value = formatNumber(tickspeed*Game.shippt/gameslow) + " /sec";
	
	
}

function updateCosts()
{
	document.getElementById( "minerbutton").value = Game.minername + " Costs " + formatNumber(Game.minercost) + Game.goldname;

	if (Game.goldbuy == 1)
	{
		document.getElementById( "foremanbutton").value = Game.foremanname + " Costs " + formatNumber(Game.foremancost) + Game.goldname;
		document.getElementById( "shipbutton").value = Game.shipname + " Costs " + formatNumber(Game.shipcost) + Game.goldname;
	}
	else
	{
		document.getElementById( "foremanbutton").value = Game.foremanname + " Costs " + formatNumber(Game.foremancost) + Game.minername;
		document.getElementById( "shipbutton").value = Game.shipname + " Costs " + formatNumber(Game.shipcost) + Game.foremanname;
	}
	
	//upgrade costs
	if (Game.clicktype == "gold")
		document.getElementById( "goldbutton").value = "Click  " + "+ " + formatNumber(Game.goldmod) + " " + Game.goldname;
	else if (Game.clicktype == "miner")
		document.getElementById( "goldbutton").value = "Click  " + "+ " + formatNumber(Game.goldmod) + Game.goldname + " and " + formatNumber(Game.goldmod*0.1) + " " + Game.minername;
		
	document.getElementById( "goldupgradebutton").value = "Upgrade Clicks  " +  " Costs " + formatNumber(Game.goldupcost) + Game.goldname;
	document.getElementById( "minerupgradebutton").value = "Upgrade" + Game.minername + " " + formatNumber(Game.minermod) + " Costs " + formatNumber(Game.minerupcost) + Game.goldname;
	document.getElementById( "foremanupgradebutton").value = "Upgrade" + Game.foremanname + " " + formatNumber(Game.foremanmod) + " Costs " + formatNumber(Game.foremanupcost) + Game.goldname;
	document.getElementById( "shipupgradebutton").value = "Upgrade" + Game.shipname + " " + formatNumber(Game.shipmod) + " Costs " + formatNumber(Game.shipupcost) + Game.goldname;

	
}

function grayButtons()
{
	//units	
	if (Game.gold >= Game.minercost)
		document.getElementById( "minerbutton").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
	else
		document.getElementById( "minerbutton").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';
	
	if (Game.goldbuy == 1)
	{		
		if (Game.gold >= Game.foremancost)
			document.getElementById( "foremanbutton").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
		else
			document.getElementById( "foremanbutton").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';
		
		if (Game.gold >= Game.shipcost)
			document.getElementById( "shipbutton").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
		else
			document.getElementById( "shipbutton").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';
	}
	else
	{
		if (Game.miner >= Game.foremancost)
			document.getElementById( "foremanbutton").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
		else
			document.getElementById( "foremanbutton").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';
		
		if (Game.foreman >= Game.shipcost)
			document.getElementById( "shipbutton").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
		else
			document.getElementById( "shipbutton").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';
	}
	
	//upgrades	
	if (Game.gold >= Game.goldupcost)
		document.getElementById( "goldupgradebutton").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
	else
		document.getElementById( "goldupgradebutton").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';

	if (Game.gold >= Game.minerupcost)
		document.getElementById( "minerupgradebutton").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
	else
		document.getElementById( "minerupgradebutton").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';

	if (Game.gold >= Game.foremanupcost)
		document.getElementById( "foremanupgradebutton").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
	else
		document.getElementById( "foremanupgradebutton").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';
	if (Game.gold >= Game.shipupcost)
		document.getElementById( "shipupgradebutton").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
	else
		document.getElementById( "shipupgradebutton").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';
	
	if (document.getElementById("goldbuy") != null && Game.goldbuy === 0)
	{	
		if(Game.ship >= Game.goldbuycost)
			document.getElementById( "goldbuy").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';		
		else
			document.getElementById( "goldbuy").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';	
	}
	if (document.getElementById("minerclick") != null)
	{
		if (Game.miner >= Game.minerclickcost)
			document.getElementById( "minerclick").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';		
		else
			document.getElementById( "minerclick").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';	
	}
	if (document.getElementById("droneclick") != null)
	{
		if (Game.gold >= Game.droneclickcost)
			document.getElementById( "droneclick").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';		
		else
			document.getElementById( "droneclick").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';	
	}
	
}
}
//~~~~ TICK FUNCTIONS ~~~~
{
function offlineticks()
{
	var A = (now.getTime() - savetime.getTime());
	if (A > 120000) //2 minutes
	{		
		var seconds=Math.floor((A/1000)%60);
		var minutes=Math.floor(A/(1000*60))%60;
		var hours=Math.floor(A/(1000*60*60));
		
		var fuzz = A/3600000; //one hour will have a fuzz of 1
		
		var cur_gold = Game.gold;
		
		//for longer times offline there will be a degree of inaccuracy, however it should run in a constant amount of time
		
		for (var i = 0; i < A/delay/fuzz/gameslow; i++)
		{
			tick('offline', fuzz);
			levelup();
		}
		
		var new_gold = Game.gold;
		var earned = formatNumber(new_gold - cur_gold);
		var offlinestr = 'Offline for: ' + hours + 'hr ' + minutes + 'min ' + seconds + 'sec\n' + 'Earned ' + earned + ' gold';
		
		swal({
			title: "Offline Progress",
			text: offlinestr,
			type: "info",
			confirmButtonText: "Ok!",
			confirmButtonColor: "#004444"
		});
	}
}

function tick(display, fuzz)
{
	var modifierA = 1;
	var modifierB = 1;
	if (display === 'offline')
	{
		modifierA = fuzz;	
		Game.progress += Game.goldpt*modifierA;
	}
	else
	{
		modifierB = gameslow;	
		if (Game.droneclick)
			for (var i = 0; i < visibledrones; i++)
				count("drone");
	}
	
	Game.gold += Game.goldpt*modifierA/modifierB;
	Game.miner += Game.minerpt*modifierA/modifierB;
	Game.foreman += Game.foremanpt*modifierA/modifierB;

	Game.goldpt = Game.miner * Game.minermod;
	Game.minerpt = Game.foreman * Game.foremanmod;	
	Game.foremanpt = Game.ship * Game.shipmod;	

}

function uiTick()
{
	// auto save the game
	if (Game.it % 500 === 0)
	{
		localStorage.setItem('time', +new Date);
		localStorage.setItem('saveObject', JSON.stringify(Game));
		save_text.text = "Autosaved...";
	}	
	
	if (Game.it < 1000)
		Game.it++;	
	else
	{
		Game.it = 0;		
	}
	
	//run ui functions
	if (Game.it % 10 === 0)
	{
		updateCosts();
		var taperlevels = 1 + Math.log2(Game.level + Game.progress/Game.levelcost)/Math.log2(1.5)
		
		var loglev = Math.floor(taperlevels);		
		level_text.text = "Level " + loglev;
		
		var prog = (taperlevels % loglev);	
		progress_text.text = "Progress " + formatNumber(prog*100) + "%";
	}
	if (Game.it % 15 === 0)
	{
		grayButtons();
		checkVisibility();
		outspeed = Game.goldpt/gameslow/progtickpt;
		thrust_text.text = formatNumber(outspeed*100) + " Thrust"; 
	}	
	if (Game.it == 100)
	{
		save_text.text = "";
	}
	updateAmounts();				
	
}
}
//~~~~ BUTTON FUNCTIONS ~~~~
{
function count(who) 
{
	var modifier = 1;
	if (who == "drone")
		modifier = 0;
	if (Game.clicktype == "gold")
	{
		//Game.progress += 1*Game.goldmod*modifier;
		Game.gold += 1*Game.goldmod;
	}
	else if (Game.clicktype == "miner")
	{
		//Game.progress += 1*Game.goldmod*modifier;
		Game.gold += 1*Game.goldmod;
		
		Game.miner += 0.1*Game.goldmod;
	}
} 

function buyunit(id)
{
	if (id == "miner")
		buyminer(Game.goldbuy);
	else if (id == "foreman")
		buyforeman(Game.goldbuy);
	else if (id == "ship")
		buyship(Game.goldbuy);	
}

function buyminer(mode)
{
	if (Game.gold >= Game.minercost)
	{
		Game.gold -= Game.minercost;
		Game.miner += 1;			
		Game.minercost *= 1.2;
		Game.minercost = Math.round(Game.minercost);
		
		grayButtons();		
	}
 } 

 function buyforeman(mode)
{
	var currency;
	if (mode == 1)
		currency = Game.gold;
	else
		currency = Game.miner;

	if (currency >= Game.foremancost)
	{
		if (mode == 1)
			Game.gold -= Game.foremancost;		
		else
			Game.miner -= Game.foremancost;
		
		Game.foreman += 1;		
		Game.foremancost *= 1.05;
		Game.foremancost = Math.round(Game.foremancost);
					
		grayButtons();		
	}

 }

 function buyship(mode)
{
	var currency;
	if (mode == 1)
		currency = Game.gold;
	else
		currency = Game.foreman;

	if (currency >= Game.shipcost)
	{
		if (mode == 1)
			Game.gold -= Game.shipcost;		
		else
			Game.foreman -= Game.shipcost;
		
		Game.ship += 1;				
		Game.shipcost *= 1.1;
		Game.shipcost = Math.round(Game.shipcost);
		createDrones(dronestyle[Game.dronestyle]);	
		
		grayButtons();		
	}

 }

 function upgrade(id)
{
	console.log("Upgrade " + id);
	if (id == "gold" && Game.gold >= Game.goldupcost)
	{
		Game.gold -= Game.goldupcost;
		Game.goldupcost *= 7.5;
		Game.goldmod *=4;
	}	
	if (id == "miner" && Game.gold >= Game.minerupcost)
	{
		Game.gold -= Game.minerupcost;
		Game.minerupcost *= 3;
		Game.minermod *= 1.3;
		Game.minermod = Math.floor(Game.minermod * 100)/100;
		Game.goldpt = Game.miner * Game.minermod;

	}
	if (id == "foreman" && Game.gold >= Game.foremanupcost)
	{
		Game.gold -= Game.foremanupcost;
		Game.foremanupcost *= 3;
		Game.foremanmod *= 1.3;
		Game.foremanmod = Math.floor(Game.foremanmod * 100)/100;

		Game.minerpt = Game.foreman * Game.foremanmod;
	}
	
	if (id == "ship" && Game.gold >= Game.shipupcost)
	{
		Game.gold -= Game.shipupcost;
		Game.shipupcost *= 2.5;
		Game.shipmod *= 1.3;
		Game.shipmod = Math.floor(Game.shipmod * 100)/100;

		Game.minerpt = Game.ship * Game.shipmod;
	}
	
	if (id == "goldbuy")
	{
		if (Game.goldbuy === 0 && Game.ship >= Game.goldbuycost)
		{
			Game.ship -= Game.goldbuycost;
			createDrones(dronestyle[Game.dronestyle]);	
			Game.goldbuy = 1;
			document.getElementById( "goldbuy" ).value = "Goldbuying units enabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#7FFF00";
			
			//remove the drones lost
			createDrones(dronestyle[Game.dronestyle]);	
		}
		else if (Game.goldbuy == 1)
		{
			Game.goldbuy = 2;
			document.getElementById( "goldbuy" ).value = "Goldbuying units disabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#FFFFFF";
			
		}	
		else if (Game.goldbuy == 2)
		{
			Game.goldbuy = 1;
			document.getElementById( "goldbuy" ).value = "Goldbuying units enabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#7FFF00";		
		}
	}
	
	if (id == "minerclick" && Game.foreman >= Game.minerclickcost)
	{
		Game.foreman -= Game.minerclickcost;
		Game.clicktype = "miner";
		removeUpgrade("minerclick");	
	}	
	if (id == "droneclick" && Game.gold >= Game.droneclickcost)
	{
		Game.gold -= Game.droneclickcost;
		Game.droneclick = true;
		removeUpgrade("droneclick");	
		//start the animations for drones
		createDrones("clear");
		createDrones(dronestyle[Game.dronestyle]);	
	}	
	
	updateAmounts();		
}
}
//~~~~ CANVAS FUNCTIONS ~~~~
{
	
function initialiseCanvas()
{
	canvas = oCanvas.create({canvas: "canvas"});

//music shapes
	triangle = canvas.display.polygon({
		sides:3,
		radius: 13,
		fill: "#0aa"
	});
	musicsymbol = canvas.display.sprite(
	{
		x: canvas.width - 120 + 45,
		y: 35,
		origin: {x:"center", y:"center"},
		image: "images/musicsymbol.png",
		height: 47,
		width: 30,
		generate: true,
		loop: false,
		duration: 60*1000/120
	});
	
//unit assets	
	weaponfire = canvas.display.sprite(
	{
			x: -200, 
			y:canvas.height/2, //visually this is actually positive x since it's parent is rotated
			origin: {x:"center", y:"center"},
			image: "images/firinganim.png",
			height: 512,
			width: 512,
			generate: true,
			direction: "x",
			duration: 2 * 10,
			loop: true
	});		

	shipsprite = canvas.display.sprite(
	{
		x:canvas.width/4,
		y:canvas.height/2,
		origin: {x:"center", y:"center"},
		image: "images/shipsheet.png",
		height:150,
		width: 150,
		generate: true,
		direction: "x",
		duration: 4 * 10
	});
	
	newShot = weaponfire.clone({
		x: shipsprite.x + 100,
		y: shipsprite.y
	});
	newShot.rotate(90);
	newShot.scale(0.25, 0.25);	

	droneArray = [];
	dronesprite = canvas.display.sprite(
	{
		x:0,
		y:0,
		origin: {x:32, y:650},
		image: "images/dronesheet.jpg",
		height: 256,
		width: 256,
		generate: true,
		direction: "x",
		duration: 4 * 30,
		speed: 60/fps
	});

//text
	
	level_text = canvas.display.text({
		x: 20,
		y: canvas.height - 48,
		origin: { x: "left", y: "bottom" },
		font: "bold 24px sans-serif",
		text: "Level",
		fill: "#0aa"
	});	
	progress_text = canvas.display.text({
		x: 20,
		y: canvas.height - 24,
		origin: { x: "left", y: "bottom" },
		font: "bold 20px sans-serif",
		text: "Progress ",
		fill: "#0aa"
	});
	save_text = canvas.display.text({
		x: 20,
		y: 24,
		origin: { x: "left", y: "top" },
		font: "bold 20px sans-serif",
		text: "",
		fill: "#0aa"
	});
	music_text = canvas.display.text({
		x:canvas.width - 120 + 110,
		y: 70,
		origin: {x:"right", y:"top"},
		font: "bold 16px sans-serif",
		text: "Track",
		fill: "#0aa",
		align: "right"
	});
	thrust_text = canvas.display.text({
		x:canvas.width - 120 + 110,
		y: canvas.height - 24,
		origin: {x:"right", y:"bottom"},
		font: "bold 20px sans-serif",
		text: "",
		fill: "#0aa",
		align: "right"
	});

//background elements
	earth = canvas.display.image(
	{
		x:0, 
		y:canvas.height/2, 
		origin: {x:"left", y:"center"},
		image: "images/earthsolo.png",
		height:467,
		width:(467 + 50000)*3,		
		
		tile: true,
		tile_width: 464,
		tile_height: 467,
		tile_spacing_x: 50000,
		tile_spacing_y: 0,
		speed: 1,
	});
	starfield = canvas.display.image(
	{
		x:0,
		y:0,
		origin:{x:"left", y:"top"},
		image: "images/starfield.png",
		height: 800,
		width: 2000*2,
		
		tile: true,
		tile_width: 2000,
		tile_height: 800,
		tile_spacing_x: 0,
		tile_spacing_y: 0,	
		speed:0.002,
	});
	distantgalaxy = canvas.display.image(
	{
		x:0,
		y:0,
		origin:{x:"left", y:700},
		image: "images/distantgalaxy.jpg",
		height: 1800,
		width: 3600*2,
		
		tile: true,
		tile_width: 3600,
		tile_height: 1800,
		tile_spacing_x: 0,
		tile_spacing_y: 0,
		speed: 0.001,
	});

	
//second ship
	
	
	canvas.addChild(distantgalaxy);
	distantgalaxy.zIndex = "back";
			
	canvas.addChild(starfield);
	starfield.scale(0.7, 0.7);
	
	starfield2 = starfield.clone(
	{
		image:"images/starfield180.png",
		y:43,
		speed:0.005,
	});
	canvas.addChild(starfield2);
	starfield2.scale(0.8, 0.8);
	
	starfield3 = starfield.clone(
	{
		y:-28,
		speed:0.01,
	});
	canvas.addChild(starfield3);
	starfield3.scale(0.9, 0.9);
	
	starfield4 = starfield.clone(
	{
		image:"images/starfield180.png",
		y:-79,
		speed:0.02,
	});
	canvas.addChild(starfield4);
	
	canvas.addChild(earth);
		
	enemy = shipsprite.clone({
		x:3*canvas.width/4,
	});
	canvas.addChild(enemy);
	enemy.rotate(-90);
	enemy.startAnimation();
	
	canvas.addChild(shipsprite);
	shipsprite.rotate(90);
	shipsprite.startAnimation();
	
	canvas.addChild(level_text);
	canvas.addChild(progress_text);
	canvas.addChild(save_text);
	canvas.addChild(thrust_text);
	
	canvas.addChild(weaponfire);
	canvas.removeChild(weaponfire); //preload the weapon fire sprite
	
//music pane
	canvas.addChild(music_text);
	
	upVol = triangle.clone({
		x: canvas.width - 120,
		y: 28,
		rotation: 270
	});
	canvas.addChild(upVol);
	
	downVol = triangle.clone({
		x: canvas.width - 120,
		y: 46,
		rotation: 90
	});
	canvas.addChild(downVol);
	
	nextSong = triangle.clone({
		x: canvas.width - 120 + 80,
		y: 37,
		rotation: 0
	});
	canvas.addChild(nextSong);
	
	
	//bindings
	music_text.bind("click tap", function(){linkMusic();});
	nextSong.bind("click tap", function(){playNextSong();});
	upVol.bind("click tap", function(){upVolume();});	
	downVol.bind("click tap", function(){downVolume();});	
	shipsprite.bind("click tap", function(){fireGuns();});		
}


function drawExtras()
{	
	//move drones
	for (var i = 0; i < droneArray.length; i++)
		droneArray[i].rotation -= droneArray[i].speed;	
}

function drawBackground()
{
	//var backdist = 8/Math.log(Game.level/10 + 100);
	
	/* 	We want to move the earth in the range of their tiles, so whatever our result we take the mod of earth's actual width + the space between tiles/
		Now the variable we will be using for that can't just be based on level, 
		it needs to be smooth with progress so that explains the progress/levelcost component.
		We take the log of all this as a means of slowing down the speeds involved.
	*/
	var xwidth = earth.width/3 - earth.tile_spacing_x;	
	
	progtomove = Game.level + Game.progress/Game.levelcost;	
	earth.moveTo(500 - ((shipspeed * (earth.speed * (progtomove))) % (xwidth+earth.tile_spacing_x)), canvas.height/2);	
	starfield.moveTo(-100 - (((shipspeed * (starfield.speed * (progtomove))) % (starfield.width/2))), starfield.y);
	starfield2.moveTo(-100 - (((shipspeed * (starfield2.speed * (progtomove))) % (starfield2.width/2))), starfield2.y);
	starfield3.moveTo(-100 - (((shipspeed * (starfield3.speed * (progtomove))) % (starfield3.width/2))), starfield3.y);
	starfield4.moveTo(-100 - (((shipspeed * (starfield4.speed * (progtomove))) % (starfield4.width/2))), starfield4.y);
	distantgalaxy.moveTo(-100 - (((shipspeed * (distantgalaxy.speed * (progtomove))) % (distantgalaxy.width/2))), 0);

	//earth.moveTo(500 - ((shipspeed * (Math.log(Game.level + Game.progress/Game.levelcost)/Math.log(1.1))) % (xwidth+earth.tile_spacing_x)), canvas.height/2);
	//starfield.moveTo(-100 - (((shipspeed * (0.3 * (Math.log(Game.level + Game.progress/Game.levelcost)/Math.log(1.1)))) % (starfield.width/2))), 0);
	//distantgalaxy.moveTo(-100 - (((shipspeed * (0.1 * (Math.log(Game.level + Game.progress/Game.levelcost)/Math.log(1.1)))) % (distantgalaxy.width/2))), 0);

	
	//earth.scale(backdist, backdist);
}


function adjustBackgroundProgress()
{
	//unused with current background parallax method	
}

function drawShip()
{	
	shiptime = new Date().getTime();
	//some variance in x and y position of the ship
	shipsprite.moveTo(canvas.width/4 + 30*Math.sin(shiptime/2000 % 360), canvas.height/2 + 50*Math.sin(shiptime/9999 % 360));
	enemy.moveTo(canvas.width - 100, canvas.height/2 + 50*Math.sin((5000 + shiptime)/9999 % 360));
}

function drawScreen()
{	
	drawExtras();
	drawShip();
	drawBackground();
	canvas.redraw();
}

function createDrones(style)
{
	var targetdrones = 1 + Math.ceil(Math.log2(Game.ship));
	
	if (style == "clear")
		targetdrones = 0;
	
	if (targetdrones != visibledrones)
	{
		console.log("Target" + targetdrones + " Visible" + visibledrones);
		var startframe = 1;
		var frameit = 0;
		
		if (style !== null)
		{
			switch(style)
			{
				case "sync":
					startframe = 0;
					frameit = -1;
					break;
				case "clock":
					startframe = targetdrones; // = 12
					frameit = -2;
					break;
				case "anti":
					startframe = 0;
					frameit = 0;
					break;
				case "desync":
					startframe = 0;
					frameit = -1-(targetdrones/3);
				default:
					break;
			}
		}
		
		
		while (targetdrones > visibledrones)
		{
			//if(startframe <= 0)
				//startframe += frameit;
			
			// javascript % is not a true modulo expression, negative numbers will be screwy without this
			startframe = 1 + (((startframe % 10) + 10) % 10); 
			//if(startframe <= 0)
				//startframe += frameit;
			console.log("Frame: " + startframe);
			
			var newdrone = dronesprite.clone({frame: Math.abs(startframe)}); 
			startframe += frameit;	
			newdrone.scale(0.25,0.25);
			
			shipsprite.addChild(newdrone);
			droneArray.push(newdrone);
			if (Game.droneclick)
				newdrone.startAnimation();
			visibledrones++;
		}
		while (targetdrones < visibledrones && targetdrones >= 0) //just in case of a bug
		{
			shipsprite.removeChildAt(shipsprite.children.length-1, false);
			droneArray.pop();
			visibledrones--;
		}
		for (var i = 0; i < droneArray.length; i++)
			droneArray[i].rotation = i*360/droneArray.length;			
	}	
}

function fireGuns()
{
	count();
	if (Game.displayProjectiles)
	{
		//make a new sprite
		if (totalshots < 1)
		{
			totalshots++;
			canvas.addChild(newShot);
			newShot.frame = 1;
			newShot.x = shipsprite.x + 100;
			newShot.y = shipsprite.y;
			newShot.startAnimation();
			
			newShot.animate(
			{
				x: canvas.width - 220,
				y: canvas.height/2 + 50*Math.sin((5000 + shiptime)/9999 % 360),
			},
			{
				duration:  500,
				easing: "ease-in-quad",

			});
			newShot.animate(
			{
				x:canvas.width - 100,
				opacity:0.3
			},
			{
				duration: 800,
				easing: "ease-in-quad",
				callback: function()
				{
					this.finish();
					this.stopAnimation();
					newShot.frame = 1;
					canvas.removeChild(this);
					totalshots--;
					newShot.opacity = 1;
					//canvas.redraw();
				}			
			});
		}
	}
	
}
}
//~~~~ AUXILLARY FUNCTIONS ~~~~
{
function createUpgrade(id, type, value, classname, mouseover)
{
	var ul = document.getElementById("list");
	var li = document.createElement("li");
	
	li.style = "width: 175px; white-space:pre-line; margin-bottom: 10px;";
	
	var element = document.createElement("input");
	element.title = mouseover;
	element.type = type;
	element.id = id;
	element.value = value;
	element.onclick = function()
	{
		upgrade(id);
	};
	element.class = classname;
	
	li.appendChild(element);
	ul.appendChild(li);
}

function removeUpgrade(id)
{
		var element = document.getElementById(id);
		element.style.visibility = "hidden";
		element.parentNode.removeChild(element);
}

function initialiseUI()
{
	//set first two elements to be visible
	document.getElementById( "goldbutton").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
	document.getElementById( "goldbutton").style.visibility = "visible";
	document.getElementById( "gold").style.visibility = "visible";

	//give values to the buttons based off of javascript variables
	document.getElementById( "goldbutton").value = "Click " + "+ " + Game.goldmod + Game.goldname;
	document.getElementById( "goldbutton").title = "If you want" + Game.goldname + " you're going to have to blast the hell out of some rocks.";
	document.getElementById( "foremanbutton").title = "Helps attract more" + Game.minername + ", but many lives will be lost in acquiring this";
	document.getElementById( "minerbutton").value = "Miners  " + " Costs " + Game.minercost + Game.goldname;
	document.getElementById( "minerbutton").title = "Hire some hands to help power your engine and mine for more " + Game.goldname;
	document.getElementById( "shipbutton").value = "Drones  " + " Costs " + Game.shipcost + Game.foremanname;
	document.getElementById( "shipbutton").title = "These helpful robots will automatically bring you " + Game.foremanname;	

	//Initialise canvas text
	level_text.text = "Level " + Game.level;

	//amount of elements not visible
	visiblemax = 7;
	hiddenleft = visiblemax;
	
	if (Game.goldbuy !== 0)
	{
		//switch from default button text for goldbuying back to what it was, fixes graphical confusion
		createUpgrade(
		"goldbuy", 
		"button", 
		"Buy units with " + Game.goldname + ", costs 100 " + Game.shipname, 
		"upgrade",
		"Will let you spend " + Game.goldname + " to buy "+ Game.shipname + ", best to leave this on as it increases the cost of using other units too"
		);
		upgrade('goldbuy');
		upgrade('goldbuy');
	}
	
	if (Game.displayProjectiles)
		document.getElementById( "toggleprojectiles").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
	else
		document.getElementById( "toggleprojectiles").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';	
	
	document.getElementById( "deletesave").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
	document.getElementById( "resetdrones").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
	
}

function formatNumber(n) 
{
  for (var i = 0; i < ranges.length; i++) 
  {
    if (n >= ranges[i].divider) 
	{
		var temp = (n / ranges[i].divider);
		temp = Math.floor(temp*1000)/1000;
	
	
		//handling numbers like 25k
		if (temp % 1 === 0)
			return temp.toString() + " " + ranges[i].suffix;

		//always display 3 digits after decimal points
		else if ((temp * 1000)%10 === 0)
		{
			if ((temp * 100)%10 === 0)
				return temp.toString() + "00 " + ranges[i].suffix;
			else
				return temp.toString() + "0 " + ranges[i].suffix;
		}
		
		return temp.toString() + " " + ranges[i].suffix;

    }
  }
  var temp = Math.floor(n*10)/10;  
  if ((temp * 10) % 10 === 0)
	  return temp.toString() + ".0";
  
  return temp.toString();
}

function deleteSave()
{	
	swal
	(
		{   
			title: "Are you sure?",   
			text: "You will not be able to recover your save file!",   
			type: "warning",   
			showCancelButton: true,   
			confirmButtonColor: "#004444",   
			confirmButtonText: "Yes, delete it!",   
			closeOnConfirm: false 
		},	
		function()
		{  
			localStorage.removeItem('saveObject');
			swal
			(
				{
					title: "Deleted!", 
					text: "Your save file has been deleted.", 
					type: "success",
					confirmButtonColor: "#004444",   
					
				},
				function(){window.location.reload(true);}
			); 
		}
	);
}

function levelup()
{
	if (Game.progress/Game.levelcost >= 1)
	{
		Game.level++;
		Game.progress = 0;
		Game.levelcost *= 1.005;
		return true;
	}
	else 
	{
		return false;

	}
}

function toggleProjectiles()
{
	Game.displayProjectiles = !Game.displayProjectiles;
	
	if (Game.displayProjectiles)
		document.getElementById( "toggleprojectiles").style.backgroundColor = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
	else
		document.getElementById( "toggleprojectiles").style.backgroundColor = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';		
}

function resetDrones(init)
{
	if (init != "onload")
	{
		Game.dronestyle++;
		if (Game.dronestyle > 4)
			Game.dronestyle = 1;
		createDrones("clear");
	}
	document.getElementById( "resetdrones").value = "Drone style:" + dronestyle[Game.dronestyle];
	console.log("Attempt" + dronestyle[Game.dronestyle]);
	
	createDrones(dronestyle[Game.dronestyle]);
}

}
//~~~~ AUDIO FUNCTION ~~~~
{
function initialiseMusic()
{
	function Song(track, codec, bpm, author, title, volmod)
	{
		this.track = track;
		this.codec = codec;
		this.bpm = bpm;
		this.author = author;
		this.title = title;
		this.volmod = volmod; //unused
	}
	
	var playlistsize = 4;
	playlistiter = Math.floor(Math.random() * playlistsize - 1);

	playlist = new Array();
	
	playlist.push(new Song("audio/Startrek.mp3", "audio/mp3", 30, "ender4life", "Star Trek Bridge Ambience", 1));
	playlist.push(new Song("audio/	Klaud 9 AGAIN.ogg", "audio/ogg", 160, "LySeRGe", "Klaud 9", 0.9));
	playlist.push(new Song("audio/Melancholics Anonymous - S3rge Rybak.mp3", "audio/mp3", 169, "LySeRGe", "Melancholics Anonymous", 0.9));	
	playlist.push(new Song("audio/Aniline.mp3", "audio/mp3", 110, "Death of Sound", "Aniline", 0.6));
	playlist.push(new Song("audio/Look at me.ogg", "audio/ogg", 120, "Death of Sound", "Look at me", 0.8));
	
		
	musicplaying = false;
	music = document.getElementById("music");
	
	music.addEventListener("ended", function()
	{
		playNextSong();
	});
	
	music.loop = false;
	console.log(Game.vol);
	music.volume = Game.vol;
	
	//this is immediately replaced with the appropriate BPM version, but we need it here because that function requires starting by removing it!
	musicsymbolnew = musicsymbol.clone({
		duration: 60*1000/120,
	});
	
	playNextSong("init");
}

function playNextSong(init)
{
	if (init != "init")
		adjustRealVol("end", playlist[playlistiter].volmod); //end the previous songs volmod impact on html5 audio volume

	playlistiter++;
	if (playlistiter > playlist.length-1)
		playlistiter = 0;
	
	var songobj = playlist[playlistiter];
	
	console.log(songobj.track);
	music.type = songobj.codec;
	music.src = songobj.track;	
		
	musicplaying = false;
	adjustBPM();	
	musicPress();
	adjustRealVol("begin", songobj.volmod);
	
	music_text.text = songobj.title + "\n" + songobj.author;
}

function adjustRealVol(state, mod)
{
	if (state == "begin")
		music.volume = music.volume * mod;
	else if (state == "end")
	{
		music.volume = (music.volume/mod) ;
	}
}

function upVolume()
{
	if (music.volume/playlist[playlistiter].volmod <= 0.95)
		music.volume += 0.05;

	Game.vol = music.volume/playlist[playlistiter].volmod;
}

function downVolume()
{
	if (music.volume/playlist[playlistiter].volmod >= 0.05)
	{
		music.volume -= 0.05;
	}
	
	Game.vol = music.volume/playlist[playlistiter].volmod;
}

function musicPress()
{	
	if (musicplaying == true) 
	{
		music.pause();
		musicsymbolnew.stopAnimation();
	}
	else
	{
		music.play();
		musicsymbolnew.startAnimation();
	}
	
	musicplaying = !musicplaying;
}

function adjustBPM()
{	
	canvas.removeChild(musicsymbolnew);

	musicsymbolnew = musicsymbol.clone({
		duration: 60*1000/playlist[playlistiter].bpm,
		frame: 2,
	});

	canvas.addChild(musicsymbolnew);
	musicsymbolnew.bind("click tap", function(){musicPress();});
			
	console.log(musicsymbol.duration);
}

function linkMusic()
{
	
}

}

//~~~~ Game Code ~~~~~
{
var ranges = [
  { divider: 1e99 , suffix: 'AG' },
  { divider: 1e96 , suffix: 'AF' },
  { divider: 1e93 , suffix: 'AE' },
  { divider: 1e90 , suffix: 'AD' },
  { divider: 1e87 , suffix: 'AC' },
  { divider: 1e84 , suffix: 'AB' },
  { divider: 1e81 , suffix: 'AA' },
  { divider: 1e78 , suffix: 'Z' },
  { divider: 1e75 , suffix: 'Y' },
  { divider: 1e72 , suffix: 'X' },
  { divider: 1e69 , suffix: 'W' },
  { divider: 1e66 , suffix: 'V' },
  { divider: 1e63 , suffix: 'U' },
  { divider: 1e60 , suffix: 'T' },
  { divider: 1e57 , suffix: 'S' },
  { divider: 1e54 , suffix: 'R' },
  { divider: 1e51 , suffix: 'Q' },
  { divider: 1e48 , suffix: 'P' },
  { divider: 1e45 , suffix: 'O' },
  { divider: 1e42 , suffix: 'N' },
  { divider: 1e39 , suffix: 'M' },
  { divider: 1e36 , suffix: 'L' },
  { divider: 1e33 , suffix: 'K' },
  { divider: 1e30 , suffix: 'J' },
  { divider: 1e27 , suffix: 'I' },
  { divider: 1e24 , suffix: 'H' },
  { divider: 1e21 , suffix: 'G' },
  { divider: 1e18 , suffix: 'F' },
  { divider: 1e15 , suffix: 'E' },
  { divider: 1e12 , suffix: 'D' },
  { divider: 1e9 , suffix: 'C' },
  { divider: 1e6 , suffix: 'B' },
  { divider: 1e3 , suffix: 'A' }
];
var fps = 60;
var tickspeed = 2;
var gameslow = tickspeed * 1.6;
var shipspeed = 100;
var totalshots = 0;

initialiseCanvas();

//initialise canvas
var dronestyle = {1:"sync", 2:"clock", 3:"anti", 4:"desync"};

function NewGame()
{
	this.gold = 0;
	this.gold = 0;
	this.goldpt = 0;
	this.goldmod = 1;
	this.goldupcost = 10;
	this.goldname = " Fuel";
	 
	this.miner = 0;
	this.minercost = 20;
	this.minerpt = 0;
	this.minermod = 1;
	this.minerupcost = 1500;
	this.minername = " Crew";

	this.foreman = 0;
	this.foremancost = 10;
	this.foremanpt = 0;
	this.foremanmod = 1;
	this.foremanupcost = 25000;
	this.foremanname = " Asteroids";

	this.ship = 0;
	this.shipcost = 20;
	this.shippt = 0;
	this.shipmod = 2;
	this.shipupcost = 5000000;
	this.shipname = " Drones";

	//upgrades
	this.goldbuy = 0;
	this.goldbuycost = 100;

	this.level = 1;
	this.levelcost = canvas.width;
	this.progress = 0;
	this.it = 0;
	this.longtick = 5;

	this.clicktype = "gold";
	this.minerclickcost = 400000000;
	
	this.droneclick = false;
	this.droneclickcost = 10000000000;
	
	//settings
	this.displayProjectiles = true;
	this.dronestyle = 1;
	this.vol = 0.7;
}

var Game = new NewGame();
var visibledrones = 0;
var delay = (1000 / tickspeed);
var now = new Date(), before = new Date(); 
var savetime;
// if save file exists load it
if (localStorage.getItem('saveObject') !== null)
{
	try
	{
		var success = true;
		Game = JSON.parse(localStorage.getItem('saveObject'));		
	}
	catch(e)
	{
		success = false;
		alert(e);
		deleteSave();	
		console.log("invalid file");
	}
	if (success)
	{
		//need to re-add the drones to canvas, just in case...
		resetDrones("onload");
		//load the last date and tell the user we were offline
		//dates act funny so can't be simply placed in game object
		savetime = new Date(parseInt(localStorage.getItem('time')));  
		
		//offline progression
		offlineticks();
		
		console.log("Done with offline");		
	}
}
else
{
	swal(
	{
		title: "Welcome!",
		text:"1. Click the ship or \'Click\' button to mine fuel. \n\n2.Spend fuel to purchase units that create thrust for you.\n\n3.See how far you can travel into deep space!",
		confirmButtonText: "Let's go!",
		confirmButtonColor: "#004444"

	});
}
initialiseUI();
initialiseMusic();

console.log("Done with initialise");

//main game loop, using date based method
setInterval( function() 
{	
    now = new Date();
    var elapsedTime = (now.getTime() - before.getTime());
    if(elapsedTime > delay)
	{
		//console.log("Lag...")

        //Recover the motion lost while inactive.
		for (var i = 0; i < elapsedTime/delay; i++)
			tick('online');
	}	
	else
		tick('online');
    before = new Date();   
	
}, delay);		

 //progress loop
var progbefore = new Date(), prognow = new Date(); 
var progtickpt = 50;
var prograte = delay/progtickpt;
var oldprog = 0;

setInterval( function()
{	
	var currentprog = Game.goldpt/gameslow/progtickpt;
	var changeprog = (currentprog + oldprog*999)/1000; //this is used to smoothen out progress and create the sense of inertia in motion

    prognow = new Date();
    var elapsedTime = (prognow.getTime() - progbefore.getTime());
    if(elapsedTime > prograte)
		for (var i = 0; i < elapsedTime/prograte; i++)
			Game.progress += changeprog;
	else
		Game.progress += changeprog;
    progbefore = new Date();   

	oldprog = changeprog;
	
	levelup();
	adjustBackgroundProgress();		
}, prograte);

// screen loop
setInterval( function() 
{
	drawScreen();
}, 1000/fps);

// ui loop
setInterval( function()
{
	uiTick();
}, 1000/fps);

/*
setInterval( function()
{
	if (musicplaying)
		fireGuns();
}, 60*1000/60);*/

}

