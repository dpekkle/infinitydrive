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
					hiddenleft--;	
				}	
				break;
			case 4:
				if (Game.gold >= Game.droneclickcost * 0.5 && Game.droneclick == false)
				{
					createUpgrade(
					"droneclick", 
					"button", 
					"Drones click, costs 10 F " + Game.goldname, 
					"upgrade", 
					"Your visible drones (the amount you see, not the amount you own) will each click once per tick. The fuel earned from this doesn't increase your movement, just allows you to buy more things"
					);
					hiddenleft--;
					console.log("show ships");
				}
				else (Game.droneclick == true)
					hiddenleft--;
				break;
			case 5:
				if (Game.ship >= Game.goldbuycost * 0.5 && Game.goldbuy === 0)
				{
					createUpgrade(
					"goldbuy", 
					"button", 
					"Buy units with " + Game.goldname + ", costs 100 " + Game.shipname, 
					"upgrade",
					"Will let you spend " + Game.goldname + " to buy "+ Game.shipname + ", best to leave this on as it increases the cost of using other units too"
					);
					hiddenleft--;
					console.log("show droneclick");
				}
				else(Game.goldbuy !== 0)
					hiddenleft--;
				break;

			case 6:
				if (Game.foreman >= Game.minerclickcost * 0.5 && Game.clicktype !== "miner")
				{
					createUpgrade(
					"minerclick", 
					"button", 
					"Clicks create " + Game.minername + ", costs 10 B " + Game.foremanname, 
					"upgrade", 
					"Each click grants 0.1 base miners, multiplied by your click upgrade");
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
	
	document.getElementById( "goldpt" ).value = formatNumber(Game.goldpt) + " /tick";	
	document.getElementById( "minerspt" ).value = formatNumber(Game.minerpt) + " /tick";	
	document.getElementById( "foremanspt" ).value = formatNumber(Game.foremanpt) + " /tick";
	document.getElementById( "shipspt" ).value = formatNumber(Game.shippt) + " /tick";
	
	
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
		document.getElementById( "minerbutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "minerbutton").style.backgroundColor = "gray";
	
	if (Game.goldbuy == 1)
	{		
		if (Game.gold >= Game.foremancost)
			document.getElementById( "foremanbutton").style.backgroundColor = "lightgray";
		else
			document.getElementById( "foremanbutton").style.backgroundColor = "gray";
		
		if (Game.gold >= Game.shipcost)
			document.getElementById( "shipbutton").style.backgroundColor = "lightgray";
		else
			document.getElementById( "shipbutton").style.backgroundColor = "gray";
	}
	else
	{
		if (Game.miner >= Game.foremancost)
			document.getElementById( "foremanbutton").style.backgroundColor = "lightgray";
		else
			document.getElementById( "foremanbutton").style.backgroundColor = "gray";
		
		if (Game.foreman >= Game.shipcost)
			document.getElementById( "shipbutton").style.backgroundColor = "lightgray";
		else
			document.getElementById( "shipbutton").style.backgroundColor = "gray";
	}
	
	//upgrades	
	if (Game.gold >= Game.goldupcost)
		document.getElementById( "goldupgradebutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "goldupgradebutton").style.backgroundColor = "gray";

	if (Game.gold >= Game.minerupcost)
		document.getElementById( "minerupgradebutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "minerupgradebutton").style.backgroundColor = "gray";

	if (Game.gold >= Game.foremanupcost)
		document.getElementById( "foremanupgradebutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "foremanupgradebutton").style.backgroundColor = "gray";
	if (Game.gold >= Game.shipupcost)
		document.getElementById( "shipupgradebutton").style.backgroundColor = "lightgray";
	else
		document.getElementById( "shipupgradebutton").style.backgroundColor = "gray";
	
	if (document.getElementById("goldbuy") != null && Game.goldbuy === 0)
	{	
		if(Game.ship >= Game.goldbuycost)
			document.getElementById( "goldbuy").style.backgroundColor = "lightgray";		
		else
			document.getElementById( "goldbuy").style.backgroundColor = "gray";	
	}
	if (document.getElementById("minerclick") != null)
	{
		if (Game.miner >= Game.minerclickcost)
			document.getElementById( "minerclick").style.backgroundColor = "lightgray";		
		else
			document.getElementById( "minerclick").style.backgroundColor = "gray";	
	}
	if (document.getElementById("droneclick") != null)
	{
		if (Game.gold >= Game.droneclickcost)
			document.getElementById( "droneclick").style.backgroundColor = "lightgray";		
		else
			document.getElementById( "droneclick").style.backgroundColor = "gray";	
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
			console.log('i: ' + i);
		}
		
		var new_gold = Game.gold;
		var earned = formatNumber(new_gold - cur_gold);
		
		alert('Offline for: ' + hours + 'hr ' + minutes + 'min ' + seconds + 'sec\n' + 'Earned ' + earned + ' gold');
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

function uiTick(state)
{
	// auto save the game
	if (Game.it % 500 === 0)
	{
		localStorage.setItem('time', +new Date);
		localStorage.setItem('saveObject', JSON.stringify(Game));
		save_text.text = "Autosaved...";
	}	
	//only update ui when the tab is selected
	if (state === 'here')
	{		
		if (Game.it < 1000)
			Game.it++;	
		else
			Game.it = 0;
		
		//run ui functions
		if (Game.it % 6 === 0)
		{
			updateCosts();
			
			var loglev = Math.floor((1 + Math.log2(Game.level)));
			level_text.text = "Level " + loglev;
			
			var prog = Game.level / Math.pow(2, loglev);
			progress_text.text = "Progress " + Math.floor(10000*prog)/100 + "%";
			
			console.log("level" + Game.level);

		}
		if (Game.it % 20 === 0)
		{
			grayButtons();
			checkVisibility();
			save_text.text = "";
		}			
		updateAmounts();			
	}	
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
		createDrones();
		
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
			createDrones();
			Game.goldbuy = 1;
			document.getElementById( "goldbuy" ).value = "Goldbuying units enabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#7FFF00";
			
			//remove the drones lost
			createDrones();		
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
		createDrones();
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
		radius: 12,
		fill: "#0aa"
	});
	
	controlpane = canvas.display.rectangle(
	{
		x: canvas.width - 100,
		y: 10,
		width: 90,
		height: 50,
	});

	musicsymbol = canvas.display.sprite(
	{
		x: 60,
		y: 25,
		origin: {x:"center", y:"center"},
		image: "images/musicsymbol.png",
		height: 188,
		width: 120,
		generate: true,
		loop: true,
		duration: 60*1000/120
	});
//unit assets	
	weaponfire = canvas.display.sprite(
	{
			x:-200, 
			y:canvas.height/2, //visually this is actually positive x since it's parent is rotated
			origin: {x:"center", y:"center"},
			image: "images/firinganim.png",
			height: 512,
			width: 512,
			generate: true,
			direction: "x",
			duration: 2 * 10,
			loop: false
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
		x: canvas.width - 20,
		y: canvas.height - 24,
		origin: { x: "right", y: "bottom" },
		font: "bold 24px sans-serif",
		text: "",
		fill: "#0aa"
	});

//background elements

	earth = canvas.display.image(
	{
		x:0, 
		y:canvas.height/2, 
		origin: {x:"left", y:"center"},
		image: "images/earthsolo.png",
		height:467,
		width:(467 + 5000)*3,		
		
		tile: true,
		tile_width: 464,
		tile_height: 467,
		tile_spacing_x: 5000,
		tile_spacing_y: 0,
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
	});

	
//second ship
		
	
	canvas.addChild(distantgalaxy);
	distantgalaxy.zIndex = "back";
	
	canvas.addChild(earth);
	earth.zIndex = "front"; 
	
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
	
	canvas.addChild(weaponfire);
	canvas.removeChild(weaponfire); //preload the weapon fire sprite
	
	//music pane
	canvas.addChild(controlpane);
	controlpane.addChild(musicsymbol);
	musicsymbol.scale(0.25, 0.25);
	
	upVol = triangle.clone({
		x: 15,
		y: 18,
		rotation: 270
	});
	controlpane.addChild(upVol);
	
	downVol = triangle.clone({
		x: 15,
		y: 36,
		rotation: 90
	});
	controlpane.addChild(downVol);
	
	//bindings
	upVol.bind("click tap", function(){upVolume();});	
	downVol.bind("click tap", function(){downVolume();});	
	shipsprite.bind("click tap", function(){fireGuns();});	
	musicsymbol.bind("click tap", function(){musicPress();});
}


function drawExtras()
{	
	//move drones
	for (var i = 0; i < droneArray.length; i++)
		droneArray[i].rotation -= droneArray[i].speed;	
}

function drawBackground()
{
	//var backdist = 1/Math.log(Game.level/10 + 2);
	
	/* 	We want to move the earth in the range of their tiles, so whatever our result we take the mod of earth's actual width + the space between tiles/
		Now the variable we will be using for that can't just be based on level, 
		it needs to be smooth with progress so that explains the progress/levelcost component.
		We take the log of all this as a means of slowing down the speeds involved.
	*/
	var xwidth = earth.width/3 - earth.tile_spacing_x;	
	earth.moveTo(500 - (((shipspeed * ((Math.log(Game.level + Game.progress/Game.levelcost)/Math.log(1.1)) - 1)) % (xwidth+earth.tile_spacing_x)) + 1), canvas.height/2);
	distantgalaxy.moveTo((-100 - (((shipspeed * (0.1 * (Math.log(Game.level + Game.progress/Game.levelcost)/Math.log(1.1)) - 1)) % (distantgalaxy.width)) + 1)), 0);
	
	//background.scale(backdist, backdist);
}

function adjustBackgroundProgress()
{
	//unused with current background parallax method	
}

function drawShip()
{	
	var shiptime = new Date().getTime();
	//some variance in x and y position of the ship
	shipsprite.moveTo(canvas.width/4 + 30*Math.sin(shiptime/2000 % 360), canvas.height/2 + 50*Math.sin(shiptime/9999 % 360));
	enemy.moveTo(canvas.width - 100, shipsprite.y);
}

function drawScreen()
{	
	drawExtras();
	drawShip();
	drawBackground();
	canvas.redraw();
}

function createDrones(clear)
{
	var targetdrones;
	if (clear == "clear")
		targetdrones = 0;		
	else
		var targetdrones = 1 + Math.ceil(Math.log2(Game.ship));
		
	if (targetdrones != visibledrones)
	{
		while (targetdrones > visibledrones)
		{
			var newdrone = dronesprite.clone();
			newdrone.scale(0.25,0.25);
			
			shipsprite.addChild(newdrone);
			droneArray.push(newdrone);
			if (Game.droneclick)
				newdrone.start();
			visibledrones++;
		}
		while (targetdrones < visibledrones && targetdrones >= 0) //just in case of a bug
		{
			shipsprite.removeChildAt(shipsprite.children.length-1, false);
			droneArray.pop();
			visibledrones--;
		}
		for (var i = 0; i < droneArray.length; i++)
		{
			droneArray[i].rotation = i*360/droneArray.length;			
		}		
	}	
}

function fireGuns()
{
	//make a new sprite
	if (canvas.children.length < 20)
	{
		var newShot = weaponfire.clone({
			x: shipsprite.x + 100,
			y: shipsprite.y
		});
		canvas.addChild(newShot);
		newShot.rotate(90);
		newShot.scale(0.25, 0.25);
		newShot.startAnimation();
		canvas.redraw();		
		
		
		newShot.animate(
		{
			x: canvas.width - 140,
		},
		{
			duration:  700,
			easing: "ease-in-out-quint",
			callback: function()
			{
				this.finish();
				canvas.removeChild(this);
				canvas.redraw();
			}
		});
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

function initialiseCosts()
{
	//set first two elements to be visible
	document.getElementById( "goldbutton").style.backgroundColor = "lightgray";
	document.getElementById( "goldbutton").style.visibility = "visible";
	document.getElementById( "gold").style.visibility = "visible";

	//give values to the buttons based off of javascript variables
	document.getElementById( "goldbutton").value = "Click " + "+ " + Game.goldmod + Game.goldname;
	document.getElementById( "foremanbutton").value = "Foremans  " + " Costs " + Game.foremancost + Game.minername;
	document.getElementById( "foremanbutton").title = "Helps attract more" + Game.minername + ", but many lives will be lost in acquiring this";
	document.getElementById( "minerbutton").value = "Miners  " + " Costs " + Game.minercost + Game.goldname;
	document.getElementById( "minerbutton").title = "Hire some hands to help power your engine and mine for more " + Game.goldname;
	document.getElementById( "shipbutton").value = "Drones  " + " Costs " + Game.shipcost + Game.foremanname;
	document.getElementById( "shipbutton").title = "These helpful robots will automatically bring you " + Game.foremanname;	

	//document.getElementById( "goldupgradebutton").value = "Upgrade Clicks  " + " Costs " + Game.goldupcost + Game.goldname;
	//document.getElementById( "minerupgradebutton").value = "Upgrade Miners  " + " Costs " + Game.minerupcost + Game.goldname;
	//document.getElementById( "foremanupgradebutton").value = "Upgrade Foremen  " + " Costs " + Game.foremanupcost + Game.goldname;
	//document.getElementById( "shipupgradebutton").value = "Upgrade Drones  " + " Costs " + Game.shipupcost + Game.goldname;

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
	if (confirm('Are you sure you want to delete your save file? All progress will be lost'))
	{
		localStorage.removeItem('saveObject');
		window.location.reload(true); //true to get new updates, pulls new page from server
	}
}

function levelup()
{
	if (Game.progress/Game.levelcost >= 1)
	{
		Game.level++;
		Game.progress = 0;
		//Game.levelcost *= 1.001;
		return true;
	}
	else 
		return false;
}
}
//~~~~ AUDIO FUNCTION ~~~~
{
function initialiseMusic()
{
	musicplaying = false;
	var audio = document.getElementById("music");
	audio.loop = true;
	audio.volume = 0.5;
}

function upVolume()
{
	var audio = document.getElementById("music");
	if (audio.volume <= 0.9)
		audio.volume += 0.1;
	
}

function downVolume()
{
	var audio = document.getElementById("music");
	if (audio.volume >= 0.1)
		audio.volume -= 0.1;
}

function musicPress()
{	
	var audio = document.getElementById("music");
	if (musicplaying == true) 
	{
		music.pause();
		musicsymbol.stopAnimation();
	}
	else
	{
		music.play();
		musicsymbol.startAnimation();
	}
	
	musicplaying = !musicplaying;
}
}

//~~~~ Game Code ~~~~~
{
var ranges = [
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
var fps = 144;
var tickspeed = 2;
var gameslow = tickspeed * 1.6;
var shipspeed = 100;

initialiseCanvas();
initialiseMusic();

//initialise canvas

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
	this.droneclickcost = 10000000;
	
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
		createDrones();	
		//load the last date and tell the user we were offline
		//dates act funny so can't be simply placed in game object
		savetime = new Date(parseInt(localStorage.getItem('time')));  
		
		//offline progression
		offlineticks();
		
		console.log("Done with offline");		
	}
}

initialiseCosts();


console.log("Done with initialise");

//main game loop, using date based method
var tab = 'here';
setInterval( function() 
{	
    now = new Date();
    var elapsedTime = (now.getTime() - before.getTime());
    if(elapsedTime > delay)
	{
		console.log("Lag...")

        //Recover the motion lost while inactive.
		for (var i = 0; i < elapsedTime/delay; i++)
		{
			tick('online');
			tab = 'away';
		}
	}	
	else
	{
		tick('online');
		tab = 'here';
	}
    before = new Date();   
	
}, delay);		

 //progress loop
var progbefore = new Date(), prognow = new Date(); 
var progtickpt = 50;
var prograte = delay/progtickpt;

setInterval( function()
{	
    prognow = new Date();
    var elapsedTime = (prognow.getTime() - progbefore.getTime());
    if(elapsedTime > prograte)
		for (var i = 0; i < elapsedTime/prograte; i++)
			Game.progress += Game.goldpt/gameslow/progtickpt;
	else
		Game.progress += Game.goldpt/gameslow/progtickpt;
    progbefore = new Date();   
	
	levelup();
	adjustBackgroundProgress();	
}, prograte);

// screen loop
setInterval( function() 
{
	drawScreen();
	uiTick(tab);
}, 1000/fps);

/*
setInterval( function()
{
	if (musicplaying)
		fireGuns();
}, 60*1000/60);*/

}

