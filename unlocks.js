function unlockobj(index, id, cost, costtype, text, mouseover)
{
	this.id = id;
	this.cost = cost;
	this.costtype = costtype;
	this.text = text;
	this.mouseover = mouseover;
	this.state = 0; //0 inactive, 1 unbought, 2 bought
	this.index = index;
}

function checkUnlocks()
{
	for (var i = 0; i < Game.unlockArray.length; i++)
	{
		var obj = Game.unlockArray[i];
		
		if (obj.state === 0)
		{
			if (obj.cost < eval(obj.costtype) * 10) //checkvis for unlocks
			{
				console.log("Create " + obj.id + " button");

				createUpgrade(obj.index, obj.id, "button", obj.text, "upgrade", obj.mouseover);
				obj.state = 1;			
			}
		}
		
		else if (obj.state === 1) //graybuttons for unlocks
		{
			if (obj.cost < eval(obj.costtype))
				setActiveButton(document.getElementById( obj.id ), 2);
		}

	}
}

function reloadUnlocks()
{
	for (var i = 0; i < Game.unlockArray.length; i++)
	{
		if (obj.state !== 0)
		{
			createUpgrade(obj.index, obj.id, "button", obj.text, "upgrade", obj.mouseover);
		}
	}	
}

function initialiseUnlocks()
{

	var un1 = new unlockobj(0, "beer", 1500, "Game.gold",
							"Free beer fridays<br> + 5" + Game.minername + "<br> Costs " + formatNumber(Game.beercost) + " " + Game.goldname, 
							"Attract 5 extra crew members!",
							);
	var un2 = new unlockobj(1, "droneclick", 1000000000000, "Game.gold",
							"Drones click, costs " + formatNumber(Game.droneclickcost) + " " + Game.goldname, 
							"Your visible drones (the amount you see, not the amount you own) will each click once per tick. The fuel earned from this doesn't increase your movement, just allows you to buy more things"
							); //10 C fuel
	
	var un3 = new unlockobj(2, "minerclick", 400000000, "Game.foreman",
							"Clicks create" + Game.minername + ", costs " + formatNumber(Game.minerclickcost) + " " + Game.foremanname, 
							"Each click grants 0.1 base" + Game.minername + ", multiplied by your click upgrade");
							); //400 B asteroids
	var un4 = new unlockobj(3, "goldbuy", 50, "Game.ship",
							"Buy all units with" + Game.goldname + ", costs " + Game.goldbuycost + " " + Game.shipname, 
							"Will let you spend" + Game.goldname + " to buy"+ Game.shipname + ", best to leave this on as it increases the cost of using other units too"		
							);
	
	Game.unlockArray.push(un1);
	Game.unlockArray.push(un2);
	Game.unlockArray.push(un3);
	Game.unlockArray.push(un4);
}


function createUpgrade(index, id, type, value, classname, mouseover)
{
	var tabtitle = document.getElementById("untab");
	
	var div = document.getElementById("list3");
	var element = document.createElement("button");
	
	element.title = mouseover;	
	element.style = "display: inline-block;";
	element.id = id;
	element.className = "upgrade";
	element.innerHTML = value;
	
	element.onclick = function()
	{
		unlock(id, index);
	};
		
	div.appendChild(element);
	customNote(Game.alertstyle, "New Unlock", "", 0);
}

function activateUpgrade(index)
{
	var obj = Game.unlockArray[index];
	var element = document.getElementById(obj.id);
	element.style.backgroundColor = "7FFF00";
	obj.state = 2; //bought
	
	tabNotification[2]--;
	updateBottomTabTitle();

}

 function unlock(id, index)
 {	
	var obj = Game.unlockArray[index];
	if (id == "beer" && obj.state === 1)
	{
		if (obj.cost < eval(obj.costtype))
		{
			Game.gold -= Game.beercost;
			Game.miner += 5;
			activateUpgrade(index);	
		}
	}
	if (id == "droneclick" && obj.state === 1)
	{
		if (obj.cost < eval(obj.costtype))
		{

			Game.gold -= Game.droneclickcost;
			
			Game.droneclick = true; //can change these bool type things to use states
			activateUpgrade(index);	
			
			//start the animations for drones
			createDrones("clear");
			createDrones(dronestyle[Game.dronestyle]);	
			//show the drone styles setting
			document.getElementById("resetdrones").style.display = "inline-block";
			customNote(Game.alertstyle, "Drone styles", "You can change the way your drones appear on the screen, currently they are set to: " + dronestyle[Game.dronestyle], 0);
		}
	}	
	
/* 	see initialiseUI for goldbuy ugprade hack
	if (id == "goldbuy")
	{
		if (Game.goldbuy === 0 && Game.ship >= Game.goldbuycost)
		{
			Game.ship -= Game.goldbuycost;
			createDrones(dronestyle[Game.dronestyle]);	
			Game.goldbuy = 1;
			document.getElementById( "goldbuy" ).innerHTML = "Fuel buying units enabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#7FFF00";
			
			// remove the drones lost
			createDrones(dronestyle[Game.dronestyle]);
			
		}
		
		else if (Game.goldbuy == 1)
		{
			Game.goldbuy = 2;
			document.getElementById( "goldbuy" ).innerHTML = "Fuel buying units disabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#FFFFFF";
			
		}	
		else if (Game.goldbuy == 2)
		{
			Game.goldbuy = 1;
			document.getElementById( "goldbuy" ).innerHTML = "Fuel buying units enabled";
			document.getElementById( "goldbuy").style.backgroundColor = "#7FFF00";		
		}
	}
 */	
	if (id == "minerclick" && Game.foreman >= Game.minerclickcost)
	{
		Game.foreman -= Game.minerclickcost;
		Game.clicktype = "miner";
		activateUpgrade(index);	
	}	

	
	updateAmounts();		
}