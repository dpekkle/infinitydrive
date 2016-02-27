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
	var change = hiddenleft;
	if (hiddenleft > 0)
	{
		switch(visiblemax - hiddenleft)
		{
			case 0:
				document.getElementById( "goldupgradebutton").style.display = "inline-block";
				hiddenleft--;
				break;
			case 1:
				if (Game.gold >= Game.minercost || Game.miner > 0)
				{
					document.getElementById( "minercomb").style.display = "inline-block";
					document.getElementById("minerupgradebutton").style.display = "inline-block";
					hiddenleft--;
					if (Game.tutorialprogress < 3)
					{
						Game.tutorialprogress++;
						var x = (customNote(Game.alertstyle, Game.minername, 
						"You can spend " + Game.goldname + " to buy " + Game.minername + ". \n\n" + Game.minername + " will generate more " 
						+ Game.goldname + " automatically.\n They also are the ONLY unit that will generate thrust for you, which moves your ship. ", 0));
						if (Game.alertstyle == "Small")
							notearray.push(x);
					}
				}
				break;		
			case 2:
				if (Game.miner >= Game.foremancost * 0.5 || Game.foreman > 0)
				{
					document.getElementById( "foremancomb").style.display = "inline-block";
					document.getElementById( "foremanupgradebutton").style.display = "inline-block";
					hiddenleft--;
					if (Game.tutorialprogress < 4)
					{
						Game.tutorialprogress++;
						var x = customNote(Game.alertstyle, Game.foremanname, 
						"You can spend " + Game.minername + " to buy " + Game.foremanname + ". \n\n" + Game.foremanname + "  will create " + Game.minername + " for you.", 0);
						if (Game.alertstyle == "Small")
							notearray.push(x);
						
						customNote(Game.alertstyle, "Multi-buy", 
						"Hold control to buy the maximum amount of units you can afford", 0);
					}
				}	
				break;		
			case 3:
				if (Game.gold >= Game.beercost && Game.beercost !== 0)
				{
					createUpgrade(
						"beer", 
						"button", 
						"Free beer fridays<br> + 5" + Game.minername + "<br> Costs " + formatNumber(Game.beercost) + " " + Game.goldname, 
						"upgrade", 
						"Attract 5 extra crew members!"
					);
					hiddenleft--;
					console.log("show ships");
					if (Game.tutorialprogress < 5)
					{
						Game.tutorialprogress++;
						var x = (customNote(Game.alertstyle, "Unlocks", 
						"Special unlocks can be purchased to grant a variety of different changes. Mouse-over an unlock to learn more about it.", 0));	
						if (Game.alertstyle == "Small")
							notearray.push(x);
					}
				}
				else if (Game.beercost === 0)
					hiddenleft--;
				break;
				
			case 4:
				if (Game.foreman >= Game.shipcost * 0.5 || Game.ship > 0)
				{
					document.getElementById( "shipcomb").style.display = "inline-block";
					document.getElementById("shipbutton").style.display = "inline-block";
					document.getElementById("shipupgradebutton").style.display = "inline-block";	
					hiddenleft--;	
					if (Game.tutorialprogress < 6)
					{
						Game.tutorialprogress++;
						var x = customNote(Game.alertstyle, Game.shipname, 
						"You can spend " + Game.foremanname + " to buy " + Game.shipname + ". \n\n" + Game.shipname + "  will create " + Game.foremanname + " for you. \nThey can also be upgraded with more unlocks.", 0);
						if (Game.alertstyle == "Small")
							notearray.push(x);
					}
				}	
				break;
			case 5:
				if (Game.droneclick == true)
					hiddenleft--;
				else if (Game.gold >= Game.droneclickcost * 0.1 && Game.droneclick == false)
				{
					createUpgrade(
					"droneclick", 
					"button", 
					"Drones click, costs " + formatNumber(Game.droneclickcost) + " " + Game.goldname, 
					"upgrade", 
					"Your visible drones (the amount you see, not the amount you own) will each click once per tick. The fuel earned from this doesn't increase your movement, just allows you to buy more things"
					);
					hiddenleft--;
				}
				break;
			case 6:
				if (Game.goldbuy !== 0)
					hiddenleft--;
				else if (Game.ship >= Game.goldbuycost * 0.1)
				{
					createUpgrade(
					"goldbuy", 
					"button", 
					"Buy all units with" + Game.goldname + ", costs " + Game.goldbuycost + " " + Game.shipname, 
					"upgrade",
					"Will let you spend" + Game.goldname + " to buy"+ Game.shipname + ", best to leave this on as it increases the cost of using other units too"
					);
					hiddenleft--;
				}
				break;

			case 7:
				if (Game.clicktype == "miner")
					hiddenleft--;
				else if (Game.foreman >= Game.minerclickcost * 0.1)
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
			
			case 8:
				break;
		}
	}
	if (change !== hiddenleft)
		updateCosts();
}

function updateAmounts()
{
	document.getElementById( "gold" ).value = formatNumber(Game.gold);	
	document.getElementById( "miners" ).value = formatNumber(Game.miner);
	document.getElementById( "foremans" ).value = formatNumber(Game.foreman);
	document.getElementById( "ships" ).value = formatNumber(Game.ship);
	document.getElementById( "goldrate" ).value = formatNumber(tickspeed*Game.goldpt/gameslow) + " / s";	
	document.getElementById( "minersrate" ).value = formatNumber(tickspeed*Game.minerpt/gameslow) + " / s";	
	document.getElementById( "foremansrate" ).value = formatNumber(tickspeed*Game.foremanpt/gameslow) + " / s";
	document.getElementById( "shipsrate" ).value = formatNumber(tickspeed*Game.shippt/gameslow) + " / s";
		
	// ATM no way to earn ships automatically
	//document.getElementById( "shipspt" ).value = ;	
	
	
}

function maxBuyDisplay(ctrlmod, resource, cost, rate, name)
{
	if (ctrlmod)
	{
		var units = 0;
		var totalcost = 0;
		var unitcost = cost;
		while (resource > totalcost)
		{
			totalcost += unitcost;
			if (resource > totalcost)
			{
				units++;
				unitcost *= rate;
			}
		}
		totalcost -= unitcost;
		
		var str = " (" + units + ")<br>Costs " + formatNumber(totalcost) + name;
		return str;
		
	}
	else
	{
		var str = ("<br>Costs " + formatNumber(cost) + name);
		return str;
	}
}

function updateCosts()
{		
	document.getElementById( "minerbutton").innerHTML = Game.minername + maxBuyDisplay(ctrlmod, Game.gold, Game.minercost, Game.minercostrate, Game.goldname);

	if (Game.goldbuy == 1)
	{
		document.getElementById( "foremanbutton").innerHTML = Game.foremanname +  maxBuyDisplay(ctrlmod, Game.gold, Game.foremancost, Game.foremancostrate, Game.goldname);
		document.getElementById( "shipbutton").innerHTML = Game.shipname + maxBuyDisplay(ctrlmod, Game.gold, Game.shipcost, Game.shipcostrate, Game.goldname);
	}
	else
	{
		document.getElementById( "foremanbutton").innerHTML = Game.foremanname + maxBuyDisplay(ctrlmod, Game.miner, Game.foremancost, Game.foremancostrate, Game.minername);
		document.getElementById( "shipbutton").innerHTML = Game.shipname + maxBuyDisplay(ctrlmod, Game.foreman, Game.shipcost, Game.shipcostrate, Game.foremanname);
	}
	
	//upgrade costs
	if (Game.clicktype == "gold")
		document.getElementById( "goldbutton").innerHTML = Game.goldname + "<br>Click " + "+ " + formatNumber(Game.goldmod);
	else if (Game.clicktype == "miner")
		document.getElementById( "goldbutton").innerHTML = Game.goldname + "<br>Click " + "+ " + formatNumber(Game.goldmod) + " (Bonus " + formatNumber(Game.goldmod*0.01) + " " + Game.minername + ")";
		
	document.getElementById( "goldupgradebutton").innerHTML = "Boost Clicks<br>" +  formatNumber(Game.goldmod) + "<br>Costs " + formatNumber(Game.goldupcost) + Game.goldname;
	document.getElementById( "minerupgradebutton").innerHTML = "Boost" + Game.minername + "<br>" + formatNumber(Game.minermod) + "<br>Costs " + formatNumber(Game.minerupcost) + Game.goldname;
	document.getElementById( "foremanupgradebutton").innerHTML = "Boost" + Game.foremanname + "<br>" + formatNumber(Game.foremanmod) + "<br>Costs " + formatNumber(Game.foremanupcost) + Game.goldname;
	document.getElementById( "shipupgradebutton").innerHTML = "Boost" + Game.shipname + "<br>" + formatNumber(Game.shipmod) + "<br>Costs " + formatNumber(Game.shipupcost) + Game.goldname;

	grayButtons();
}

function updateBottomTabTitle()
{
	var tabtitle = document.getElementById("buytab");
	tabtitle.innerHTML = "Buy (" + tabNotification[0] + ")";
	var tabtitle = document.getElementById("uptab");
	tabtitle.innerHTML = "Upgrade (" + tabNotification[1] + ")";
	var tabtitle = document.getElementById("untab");
	tabtitle.innerHTML = "Unlocks (" + tabNotification[2] + ")";	
}

function setActiveButton(elem, note)
{
	if (elem.style.backgroundColor != activecolour)
	{
		tabNotification[note]++;
		updateBottomTabTitle();	
	}
	elem.style.backgroundColor = activecolour ; 
	
}

function setInactiveButton(elem, note)
{

	if (elem.style.backgroundColor == activecolour)
	{
		tabNotification[note]--;
		updateBottomTabTitle();	
	}
	elem.style.backgroundColor = inactivecolour; 

}

function grayButtons()
{
	testcolour = "rgb(0, 170, 170)"
	//units	
	if (Game.gold >= Game.minercost)
		setActiveButton(document.getElementById( "minerbutton"), 0);
	else
		setInactiveButton(document.getElementById( "minerbutton"), 0);
	
	if (Game.goldbuy == 1)
	{		
		if (Game.gold >= Game.foremancost)
			setActiveButton(document.getElementById( "foremanbutton"), 0);
		else
			setInactiveButton(document.getElementById( "foremanbutton"), 0);
		
		if (Game.gold >= Game.shipcost)	
			setActiveButton(document.getElementById( "shipbutton"), 0);
		else
			setInactiveButton(document.getElementById( "shipbutton"), 0);
	}
	else
	{
		if (Game.miner >= Game.foremancost)
			setActiveButton(document.getElementById( "foremanbutton"), 0);
		else
			setInactiveButton(document.getElementById( "foremanbutton"), 0);
		
		if (Game.foreman >= Game.shipcost)
			setActiveButton(document.getElementById( "shipbutton"), 0);
		else
			setInactiveButton(document.getElementById( "shipbutton"), 0);
	}
	
	//upgrades
	if (Game.gold >= Game.goldupcost)
	{
		setActiveButton(document.getElementById( "goldupgradebutton"), 1);
		if (Game.gold > 0 && Game.tutorialprogress < 2)
		{
			toggleNotes();
			customNote(Game.alertstyle, "Upgrades", "You can quadruple the power of your clicks by clicking the 'Upgrade clicks' button, but this will become more expensive with each purchase.", 0);
			Game.tutorialprogress++;
		}
	}
	else
		setInactiveButton(document.getElementById( "goldupgradebutton"), 1);

	if (Game.gold >= Game.minerupcost)
		setActiveButton(document.getElementById( "minerupgradebutton"), 1);
	else
		setInactiveButton(document.getElementById( "minerupgradebutton"), 1);

	if (Game.gold >= Game.foremanupcost)
		setActiveButton(document.getElementById( "foremanupgradebutton"), 1);
	else
		setInactiveButton(document.getElementById( "foremanupgradebutton"), 1);
	
	if (Game.gold >= Game.shipupcost)
		setActiveButton(document.getElementById( "shipupgradebutton"), 1);
	else
		setInactiveButton(document.getElementById( "shipupgradebutton"), 1);

//unlocks	
	if (document.getElementById("goldbuy") != null && Game.goldbuy === 0)
	{	
		if(Game.ship >= Game.goldbuycost)
			setActiveButton(document.getElementById( "goldbuy"), 2);
		else
			setInactiveButton(document.getElementById( "goldbuy"), 2);
	}
	if (document.getElementById("minerclick") != null)
	{
		if (Game.foreman >= Game.minerclickcost)
			setActiveButton(document.getElementById( "minerclick"), 2);
		else
			setInactiveButton(document.getElementById( "minerclick"), 2);
	}
	if (document.getElementById("droneclick") != null)
	{
		if (Game.gold >= Game.droneclickcost)
			setActiveButton(document.getElementById( "droneclick"), 2);
		else
			setInactiveButton(document.getElementById( "droneclick"), 2);
	}
	if (document.getElementById("beer") != null)
	{
		if (Game.gold >= Game.beercost)
			setActiveButton(document.getElementById( "beer"), 2);
		else
			setInactiveButton(document.getElementById( "beer"), 2);
	}	
}

function closeNotes()
{
	for (var i = 0; i < notearray.length; i++)
	{
		var str = notearray[i].id;
		str = str.substr(0, str.length - 4);
		var condition;
		
		switch (str)
		{
			case Game.foremanname:
				 condition = "Game.foreman > 0";
				break;
			case Game.minername:
				condition = "Game.miner > 0";
				break;
			case Game.shipname:
				condition = "Game.ship > 0";
				break;
			case "Unlocks":
				condition = "document.getElementById('beer') === null"
				break;	
			default:
				console.log("Can't find this notification when checking for close conditions.");
				break;
			
		}
		
		if (eval(condition))
		{
			Notifier.obliterate(notearray[i]);
			notearray.splice(i, 1); //remove the element at i
		}

	}
	
}	

function initialiseTabs()
{
	topTabs = new SimpleTabs(document.getElementById('window-tabs'));
	botTabs = new SimpleTabs(document.getElementById('window-tabs2'));
		
	//update science tab
	document.getElementById("scienceamount").innerHTML = "Science: " + Game.science;
}

function initialiseUI()
{	
	swal.setDefaults({ confirmButtonColor: "#004444" });
	initialiseTabs();
	
	//set first two elements to be visible
	document.getElementById( "goldbutton").style.backgroundColor = activecolour;
	document.getElementById( "goldbutton").style.display = "inline-block";
	document.getElementById( "goldcomb").style.display = "inline-block";

	//give values to the buttons based off of javascript variables
	//document.getElementById( "goldbutton").innerHTML = "Click " + "+ " + Game.goldmod + Game.goldname;
	document.getElementById( "goldbutton").title = "If you want" + Game.goldname + " you're going to have to blast the hell out of some rocks.";
	document.getElementById( "foremanbutton").title = "Helps attract more" + Game.minername + ", but many lives will be lost in acquiring this";
	//document.getElementById( "minerbutton").value = "Miners  " + " Costs " + Game.minercost + Game.goldname;
	document.getElementById( "minerbutton").title = "Hire some hands to help power your engine and mine for more " + Game.goldname;
	//document.getElementById( "shipbutton").value = "Drones  " + " Costs " + Game.shipcost + Game.foremanname;
	document.getElementById( "shipbutton").title = "These helpful robots will automatically bring you " + Game.foremanname;	

	//Initialise canvas text
	level_text.text = "Next Planet: ";

	//amount of elements not visible
	visiblemax = 8;
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
		document.getElementById( "toggleprojectiles").style.backgroundColor = activecolour;
	else
		document.getElementById( "toggleprojectiles").style.backgroundColor = inactivecolour;	
	
	document.getElementById( "deletesave").style.backgroundColor = activecolour;
	document.getElementById( "resetdrones").style.backgroundColor = activecolour;
	document.getElementById( "togglenotes").style.backgroundColor = activecolour;
	document.getElementById( "togglenotes").value = "Notifications: " + Game.alertstyle;
	
	if (Game.tutorialprogress > 0)
		document.getElementById("togglenotes").style.display = "inline-block";		
	
	if (Game.droneclick)
		document.getElementById("resetdrones").style.display = "inline-block";	

	//listen to keyboard
    document.onkeydown = listenToKeyDown;
    document.onkeyup = listenToKeyUp;

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
			levelup('offline');
		}
		
		var new_gold = Game.gold;
		var earned = formatNumber(new_gold - cur_gold);
		var offlinestr = 'Offline for: ' + hours + 'hr ' + minutes + 'min ' + seconds + 'sec\n' + 'Earned ' + earned + ' gold';
		
		swal({
			title: "Offline Progress",
			text: offlinestr,
			type: "info",
			confirmButtonText: "Ok!",
			closeOnConfirm: false 
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
		
		var taperlevels = 1 + Math.log2(Game.level + Game.progress/Game.levelcost)/Math.log2(1.5);		
		loglev = Math.floor(taperlevels);		
	}
	else
	{
		checkVisibility();
		modifierB = gameslow;	
		if (Game.droneclick)
			for (var i = 0; i < visibledrones; i++)
				count();
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
	}	
	
	if (Game.it < 1000)
		Game.it++;	
	else
	{
		Game.it = 0;		
	}
	
	//run ui functions
	if (Game.it % 50 === 0)
	{				
		if (!Game.shipscanning)
		{
			if (Game.planetArrayit < planetArray.length)
			{
				level_text.text = "Next: " + planetArray[Game.planetArrayit].name;
				
				var lastplanet;
				if (Game.planetArrayit === 0)
					lastplanet = 0;
				else
					lastplanet = planetArray[Game.planetArrayit-1].unlock;
						
				var prog = ( (Game.level + (Game.progress/Game.levelcost))- lastplanet)/((planetArray[Game.planetArrayit].unlock) - lastplanet);	
				
				progress_text.text = "Distance: " + formatNumber(Game.level + (Game.progress/Game.levelcost)- lastplanet) 
												  + "/" + formatNumber(planetArray[Game.planetArrayit].unlock - lastplanet) 
												  + "\n" + formatNumber(prog*100) + "%";	
		
			}
			else
			{
				level_text.text = "No planets left";
				progress_text.text	= "End of zone";			
			}
		}
	}
	if (Game.it % 15 === 0)
	{
		grayButtons();
		if (Game.alertstyle == "Small")
			closeNotes();
		outspeed = Game.goldpt/gameslow/progtickpt;
		if (!Game.shipscanning)
			thrust_text.text = formatNumber(outspeed*100) + " Thrust"; 
	}	

	updateAmounts();				
	
}
}
//~~~~ BUTTON FUNCTIONS ~~~~
{
	
function count() 
{
	clicklimit = new Date().getTime();
	
	if (clicklimit - oldclicklimit > 50)
	{
		if (Game.clicktype == "gold")
		{
			Game.gold += 1*Game.goldmod;
		}
		else if (Game.clicktype == "miner")
		{
			Game.gold += 1*Game.goldmod;
			Game.miner += 0.01*Game.goldmod;
		}
		oldclicklimit = clicklimit;
	}
	
} 

function buyunit(id)
{
	if (id == "miner")
		buyMiner(Game.goldbuy);
	
	else if (id == "foreman")
		buyForeman(Game.goldbuy);
	
	else if (id == "ship")
		buyShip(Game.goldbuy);	
	
	updateCosts();	
}

function buyMiner(mode)
{
	if (Game.gold >= Game.minercost)
	{
		Game.gold -= Game.minercost;
		Game.miner += 1;			
		Game.minercost *= Game.minercostrate;
		Game.minercost = Math.round(Game.minercost);
		if (ctrlmod)
			buyMiner(mode);
	}
 } 

 function buyForeman(mode)
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
		Game.foremancost *= Game.foremancostrate;
		Game.foremancost = Math.round(Game.foremancost);
		if (ctrlmod)
			buyForeman(mode);
					
	}
 }

 function buyShip(mode)
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
		Game.shipcost *= Game.shipcostrate;
		Game.shipcost = Math.round(Game.shipcost);
		createDrones(dronestyle[Game.dronestyle]);	
		
		if (ctrlmod)
			buyShip(mode);
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
	if (id == "beer")
	{
		Game.gold -= Game.beercost;
		Game.miner += 5;
		removeUpgrade("beer");	
		Game.beercost = 0;
		tabNotification[2]--;
		updateBottomTabTitle();
	}
	
	if (id == "goldbuy")
	{
		if (Game.goldbuy === 0 && Game.ship >= Game.goldbuycost)
		{
			Game.ship -= Game.goldbuycost;
			createDrones(dronestyle[Game.dronestyle]);	
			Game.goldbuy = 1;
			document.getElementById( "goldbuy" ).innerHTML = "Fuel buying units enabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#7FFF00";
			
			//remove the drones lost
			createDrones(dronestyle[Game.dronestyle]);
			tabNotification[2]--;
			updateBottomTabTitle();
			
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
	
	if (id == "minerclick" && Game.foreman >= Game.minerclickcost)
	{
		Game.foreman -= Game.minerclickcost;
		Game.clicktype = "miner";
		removeUpgrade("minerclick");	
		tabNotification[2]--;
		updateBottomTabTitle();

	}	
	if (id == "droneclick" && Game.gold >= Game.droneclickcost)
	{
		Game.gold -= Game.droneclickcost;
		Game.droneclick = true;
		removeUpgrade("droneclick");	
		//start the animations for drones
		createDrones("clear");
		createDrones(dronestyle[Game.dronestyle]);	
		//show the drone styles setting
		document.getElementById("resetdrones").style.display = "inline-block";
		customNote(Game.alertstyle, "Drone styles", "You can change the way your drones appear on the screen, currently they are set to: " + dronestyle[Game.dronestyle], 0);
		tabNotification[2]--;
		updateBottomTabTitle();

	}	
	
	updateCosts();
	updateAmounts();		
}
}
//~~~~ CANVAS FUNCTIONS ~~~~
{

function initialiseZoneMap()
{
	var canvas_elem = document.getElementById("zonecanvas");
	zonecanvas = oCanvas.create({canvas: canvas_elem, background: "#555"});
	
	zonecanvas.width = window.innerWidth*0.98 - 32;
	
	star = zonecanvas.display.ellipse(
	{
		x:-975,
		y:zonecanvas.height/2,
		origin: {x:"center", y:"center"},
		radius:1000,
		stroke:"1px, #000",
		fill:"#FF0"
	});
	
	zoneshipsprite = zonecanvas.display.sprite(
	{
		x:10,
		y:zonecanvas.height/2,
		origin: {x:"center", y:"center"},
		image: "images/shipsheet.png",
		height:150,
		width: 150,
		generate: true,
		direction: "x",
		duration: 4 * 10
	});
	var planeticon = zonecanvas.display.ellipse(
	{
		x:100,
		y:zonecanvas.height/2,
		origin: {x:"center", y:"center"},
		radius:10,
		stroke:"1px, #000",
		fill:"#DDD"
	});
	
	zonegalaxy = zonecanvas.display.image(
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
	zonecanvas.addChild(zonegalaxy);
	zonecanvas.addChild(star);

	
	//draw the planets
	var totalwidth = planetArray[planetArray.length-1].unlock;
	
	for (var i = 0; i < planetArray.length; i++)
	{
		var position = ((zonecanvas.width - 100) * (planetArray[i].unlock/totalwidth)) + 50;
		
		var newplanet = planeticon.clone({
			x: position,
			y: 2*((i % 2)-0.5) + zonecanvas.height/2 
		});
		zonecanvas.addChild(newplanet);
	}
	zonecanvas.addChild(zoneshipsprite);
	zoneshipsprite.rotate(90);	
	zoneshipsprite.scale(0.25, 0.25);	

	zoneshipsprite.startAnimation();

}
	
function initialiseCanvas()
{
	var canvas_elem = document.getElementById("gamecanvas");
	canvas = oCanvas.create({canvas: canvas_elem});
	
	//unit assets	
	scanner = canvas.display.ellipse(
	{
		x:0,
		y:0,
		origin:{x:"center", y:"center"},
		radius:50,
		stroke:"5px, #0aa",
	});

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
			duration: 1 * 10,
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
	
	asteroid1 = canvas.display.image(
	{
		x:3*canvas.width/4,
		y:canvas.height/2,
		origin: {x:"center", y:"center"},
		image: "images/asteroid1.jpg",
		height:150,
		width: 150,		
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
		y: canvas.height - 64,
		origin: { x: "left", y: "bottom" },
		font: "bold 20px monospace",
		text: "Level",
		fill: "#0aa"
	});	
	progress_text = canvas.display.text({
		x: 20,
		y: canvas.height - 24,
		origin: { x: "left", y: "bottom" },
		font: "bold 20px monospace",
		text: "Progress ",
		fill: "#0aa"
	});
	music_text = canvas.display.text({
		x:canvas.width - 120 + 110,
		y: 70,
		origin: {x:"right", y:"top"},
		font: "bold 16px monospace",
		text: "Play music",
		fill: "#0aa",
		align: "right"
	});
	thrust_text = canvas.display.text({
		x:canvas.width - 120 + 110,
		y: canvas.height - 24,
		origin: {x:"right", y:"bottom"},
		font: "bold 20px monospace",
		text: "",
		fill: "#0aa",
		align: "right"
	});

//background elements
	//planets
	earth = canvas.display.image(
	{
		x:2000, 
		y:canvas.height/2, 
		origin: {x:"center", y:"center"},
		image: "images/planets/earthsolo.png",
		height:467,
		width:467,		
		zIndex:5,
		
		speed: 1,
		unlock: 195, 			//to convert loglev to level use x = 2 ^(13*log2(1.5))
		seen: false,
		name: "Earth",
		lore: "The third planet in the solar system, scans indicate an Earth-like environment rich in oxygen and organic chemistry. There is evidence that life once thrived on the surface.",
		value: 2,		
	});
	
	venus = canvas.display.image(
	{
		x:2000, 
		y:canvas.height/2, 
		origin: {x:"center", y:"center"},
		image: "images/planets/venus.png",
		height:467,
		width:467,		
		zIndex:5,
		
		speed: 1,
		unlock: 2,
		seen: false,
		name: "Venus",
		lore: "A hostile environment coated in a thick layer of greenhouse gases. Rich in Sulfur resources, however landing is not advised.",
		value: 1,
	});

	placeholders = [];
	for (var i = 3; i < 21; i++)
	{
		
		placeholders.push(
			canvas.display.image(
			{
				x:2000, 
				y:canvas.height/2, 
				origin: {x:"center", y:"center"},
				image: "images/placeholder_planets/planet" + i + ".png",
				height:467,
				width:467,		
				zIndex:5,
				
				speed: 1,
				unlock: 500 + 120 * ((i*i) - 4),
				seen: false,
				name: "Planet " + i,
				lore: "Hey look it's " + name + " a placeholder planet while we design more!",
				value: i,
			})			
		);
		
	}
	
	
	starfield = canvas.display.image(
	{
		y:0,
		origin:{x:"left", y:"top"},
		image: "images/starfield2.png",
		height: 800,
		width: 2000*2,
		
		tile: true,
		tile_width: 2000,
		tile_height: 800,
		tile_spacing_x: 0,
		tile_spacing_y: 0,	
		speed:0.0025,
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

	//add to canvas
	canvas.addChild(distantgalaxy);
	distantgalaxy.zIndex = "back";
			
	canvas.addChild(starfield);
	starfield.scale(0.5, 0.5);
	
	starfield2 = starfield.clone(
	{
		image:"images/starfield1802.png",
		y:43,
		speed:0.005,
	});
	canvas.addChild(starfield2);
	starfield2.scale(0.6, 0.6);
	starfield2.rotate(-15);
	
	starfield3 = starfield.clone(
	{
		y:-28,
		speed:0.01,
	});
	canvas.addChild(starfield3);
	starfield3.scale(0.7, 0.7);
	
	starfield4 = starfield.clone(
	{
		image:"images/starfield1802.png",
		y:-79,
		speed:0.02,
	});
	canvas.addChild(starfield4);
	starfield4.rotate(15);
	starfield4.scale(0.8, 0.8);
	console.log("Star: " + starfield4.zIndex);
	canvas.addChild(asteroid1);
	console.log("Star: " + starfield4.zIndex);
	console.log("Asteroid: " + asteroid1.zIndex);
	
	canvas.addChild(shipsprite);
	shipsprite.rotate(90);
	shipsprite.startAnimation();
	
	canvas.addChild(weaponfire);
	canvas.removeChild(weaponfire); //preload the weapon fire sprite
	
	canvas.addChild(level_text);
	canvas.addChild(progress_text);
	canvas.addChild(thrust_text);
	
	
//music pane
	canvas.addChild(music_text);

	triangle = canvas.display.polygon({
		sides:3,
		radius: 13,
		fill: "#0aa"
	});
	
	musicsymbol = canvas.display.sprite(
	{
		x: -70, //attached to music_text to make things simpler with window resizes 
		y: -30,
		origin: {x:"center", y:"center"},
		image: "images/musicsymbol.png",
		height: 47,
		width: 30,
		generate: true,
		loop: true,
		duration: 60*1000/120
	});	
	
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
		y: 35,
		rotation: 0,
		radius: 14,
	});
	
	nextSong2 = triangle.clone({
		x: 14,
		y: 0,
		rotation: 0,
		radius: 14,
	});
	canvas.addChild(nextSong);
	nextSong.addChild(nextSong2);
	
	//bindings
	music_text.bind("click tap", function(){linkMusic();});
	nextSong.bind("click tap", function(){playNextSong();});
	upVol.bind("click tap", function(){upVolume();});	
	downVol.bind("click tap", function(){downVolume();});
	canvas.bind("click tap", function(){fireGuns();});
	
	changeLevel(); //fill planetArray with all the planets we made
	initialiseZoneMap();
	
	//resizing
	resizeCanvas();
	
}

function resizeCanvas() 
{
	canvas.width = window.innerWidth*0.98 - 32;
	thrust_text.moveTo(canvas.width - 10, canvas.height - 24);
	upVol.moveTo(canvas.width - 120, 28);
	downVol.moveTo(canvas.width - 120,46);
	nextSong.moveTo(canvas.width - 40,35);
	music_text.moveTo(canvas.width - 10,70);
	
	zonecanvas.destroy();
	initialiseZoneMap();
	//;
}

function drawExtras()
{	
	//move drones
	for (var i = 0; i < droneArray.length; i++)
		droneArray[i].rotation -= droneArray[i].speed;	
}
function panPlanet(type)
{
	if (type == 'offline')
	{
		console.log("Offline planet passed");
		var planet = planetArray[Game.planetArrayit];	
		planet.seen = true;
		customNote(Game.alertstyle, "Scan complete", planet.name + ": " + planet.lore, "http://dpekkle.github.io/infinitydrive/" + planet.image);
		Game.science += planet.value;
		document.getElementById("scienceamount").innerHTML = "Science: " + Game.science;
		Game.planetArrayit++;
		
		return;
	}
	
	
	console.log("Let's see planet" + Game.planetArrayit);
	var planet = planetArray[Game.planetArrayit];	

	planet.seen = true;
	//animate the planet
	canvas.addChild(planet);
	planet.zIndex = 5;
	
	if (Game.planetArrayit > 1) //if its a placeholder planet
	{
		planet.rotate(360-65);
	}
	
	var note = customNote(Game.alertstyle, "Unknown Body Detected", "Scanners indicate a celestial body in close proximity, moving in to investigate.", 0);
	
	
	//move ship in to meet planet in center
	Game.shipscanning = true;
	Game.science += planet.value;
	Game.planetArrayit++;
	
	thrust_text.text = "0 Thrust";	
	level_text.text = planet.name;
	progress_text.text = "Approaching";
	
	shipsprite.animate(
	{
		x: canvas.width/2,
		y: canvas.height/2
	},
	{
		duration: 50000/planet.speed,
		callback: function()
		{
			shipsprite.addChild(scanner);
			for (var i = 0; i < 10; i++)
			{
				scanner.animate({
					radius: 80,
					opacity: 0.0,
				},
				{
					duration: 2000,
					callback()
					{
						scanner.radius = 50;
						scanner.opacity = 0.6;
					}
				});
				scanner.delay(10);
			}
		}
	});
	
	//pan planet to center
	planet.animate(
	{
		x: canvas.width/2,
	},
	{
		duration:  50000/planet.speed,
		easing: "ease-out-quad",
		callback: function()
		{
			if (Game.alertstyle == "Small")
				Notifier.obliterate(note);
			note = customNote(Game.alertstyle, "Discovered " + planet.name, "You just reached " + planet.name + ".\n Your ship will now automatically perform scans to learn more about the planet and acquire Science.", 0);		
			progress_text.text = "Scanning...";

		}
	});
	
	planet.animate(
	{		
		//we wait a bit here, can run science animation
	},
	{
		duration: 15000,
		callback: function()
		{
			if (Game.alertstyle == "Small")
				Notifier.obliterate(note);
			//give us some nice info about the planet :)
			customNote(Game.alertstyle, "Scan complete", planet.name + ": " + planet.lore, planet.image);
			document.getElementById("scienceamount").innerHTML = "Science: " + Game.science;

			//stop scanning sprite
			shipsprite.removeChild(scanner);
			//recursive function to mesh with the sin variation of the ship
			smoothShip(20000); 
			progress_text.text = "Embarking";
			thrust_text.text = "MAX THRUST!";	

		}
	});
	planet.animate(
	{
		x:-1000,
	},
	{
		duration: 50000/planet.speed,
		easing: "ease-in-quad",
		callback: function()
		{
			this.finish();
			canvas.removeChild(this);
		}			
	});	
}

function smoothShip(dur)
{
	//destination
	var newx = canvas.width/4 + 30*Math.sin(shiptime/2000 % 360);
	var newy = canvas.height/2 + 50*Math.sin(shiptime/9999 % 360);
	
	var distance = Math.sqrt(Math.pow((shipsprite.x - newx), 2) + Math.pow((shipsprite.y - newy), 2));
	console.log("Dist: " + distance);
	
	if (dur > 100 && distance > 25)
	{
		shiptime = new Date().getTime();
		shipsprite.animate(
		{
			x: canvas.width/4 + 30*Math.sin(shiptime/2000 % 360),
			y: canvas.height/2 + 50*Math.sin(shiptime/9999 % 360),
		},
		{
			duration: dur,
			//smooth out the transition a little
			callback: function()
			{
				console.log("Smooth again");
				smoothShip(dur/1.5);
				
			}
		});
	}
	else
	{
		Game.shipscanning = false;
		console.log("Done smoothing");
	}
}

function drawBackground()
{
	
	/* 	We want to move the background in the range of their tiles, so whatever our result we take the mod of the tile width/
		Now the variable we will be using for that can't just be based on level, 
		it needs to be smooth with progress so that explains the progress/levelcost component in progtomove.
		We take the log of all this as a means of slowing down the speeds involved.
	*/
	progtomove = Game.level + Game.progress/Game.levelcost;	
	//pan past a planet

	starfield.moveTo(-100 - (((Game.shipspeed * (starfield.speed * (progtomove))) % (starfield.width/2))), starfield.y);
	starfield2.moveTo(-100 - (((Game.shipspeed * (starfield2.speed * (progtomove))) % (starfield2.width/2))), starfield2.y);
	starfield3.moveTo(-100 - (((Game.shipspeed * (starfield3.speed * (progtomove))) % (starfield3.width/2))), starfield3.y);
	starfield4.moveTo(-100 - (((Game.shipspeed * (starfield4.speed * (progtomove))) % (starfield4.width/2))), starfield4.y);
	distantgalaxy.moveTo(-100 - (((Game.shipspeed * (distantgalaxy.speed * (progtomove))) % (distantgalaxy.width/2))), 0);
}


function adjustBackgroundProgress()
{
	//unused with current background parallax method	
}

function drawZone()
{
	zoneshipsprite.moveTo(((zonecanvas.width - 100) * (Game.level/planetArray[planetArray.length-1].unlock)) + 50, zonecanvas.height/2);
}

function drawShip()
{	
	shiptime = new Date().getTime();
	//some variance in x and y position of the ship
	if (!Game.shipscanning)
		shipsprite.moveTo(canvas.width/4 + 30*Math.sin(shiptime/2000 % 360), canvas.height/2 + 50*Math.sin(shiptime/9999 % 360));
	asteroid1.moveTo(canvas.width - 100, canvas.height/2 + 50*Math.sin((5000 + shiptime)/9999 % 360));
}

function drawScreen()
{	
	if (topTabs.getActiveTab() == "gametab")
	{
		drawExtras();
		drawShip();
		drawBackground();
		canvas.redraw();
	}
	else if (topTabs.getActiveTab() == "zonetab")
	{
		drawZone();
		zonecanvas.redraw();
	}

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
					frameit = Math.floor(1+(targetdrones/3));
				default:
					break;
			}
		}
		
		
		while (targetdrones > visibledrones)
		{
			//if(startframe <= 0)
				//startframe += frameit;
			
			// javascript % is not a true modulo expression, negative numbers will be screwy without this
			startframe = 1 + (((startframe % 10) + 10) % 10); //doesnt work with floats
			console.log("Frame: " + startframe);

			if (startframe == 0)
			{
				startframe++;
			}
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
	console.log("Fire the guns");
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
				x: canvas.width - 200,
				y: canvas.height/2 + 50*Math.sin((5000 + shiptime)/9999 % 360),
			},
			{
				duration:  250,
				easing: "ease-in-quad",

			});
			newShot.animate(
			{
				x:canvas.width - 100,
				opacity:0.3
			},
			{
				duration: 200,
				easing: "ease-out-quad",
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
function testActive(elem)
{
	var col;
	if (elem.currentStyle)
        col = elem.currentStyle['backgroundColor'];
    else
		col = document.defaultView.getComputedStyle(elem,null)['backgroundColor'];
		
	return (col == inactivecolour);
}
	
function listenToKeyDown(e)
{
	if (e.keyCode == 17)
	{
		if (!ctrlmod)
		{
			ctrlmod = true;
			updateCosts();
		}
	}
}
function listenToKeyUp(e)
{
	ctrlmod = false;
	updateCosts();
}
	
function changeLevel()
{
	
	console.log("Adding the initial planets to array");
	planetArray.push(venus);
	planetArray.push(earth);

	for (var i = 0; i < placeholders.length; i++)
	{
		planetArray.push(placeholders[i]);
	}
	
	for (var i = 0; i < planetArray.length; i++)
		console.log(planetArray[i].name + " at level " + planetArray[i].unlock);

}
	
function createUpgrade(id, type, value, classname, mouseover)
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
		upgrade(id);
	};
		
	div.appendChild(element);
	customNote(Game.alertstyle, "New Unlock", "", 0)
}

function removeUpgrade(id)
{
	var element = document.getElementById(id);
	element.style.visibility = "hidden";
	element.parentNode.removeChild(element);
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
			confirmButtonText: "Yes, delete it!",   
			closeOnConfirm: false 
		},	
		function()
		{  
			swal
			(
				{
					title: "Deleted!", 
					text: "Your save file has been deleted.", 
					type: "success",	
				},
				function()
				{
					localStorage.removeItem('saveObject');
					window.location.reload(true);
				}
			); 
		}
	);
}

function levelup(type)
{
	if (Game.progress/Game.levelcost >= 1)
	{
		Game.level++;
		Game.progress = 0;
		Game.levelcost *= 1.001;
		//console.log("Level: " + Game.level + " loglev" + loglev);
		
		if (Game.planetArrayit < planetArray.length)
		{
			if (Game.level >= planetArray[Game.planetArrayit].unlock && !Game.shipscanning)
			{
				panPlanet(type);
			}
		}
	}
}

function toggleProjectiles()
{
	Game.displayProjectiles = !Game.displayProjectiles;
	
	if (Game.displayProjectiles)
		document.getElementById( "toggleprojectiles").style.backgroundColor = activecolour;
	else
		document.getElementById( "toggleprojectiles").style.backgroundColor = inactivecolour;		
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

function toggleNotes()
{
	
	if (Game.alertstyle == "Small")
		Game.alertstyle = "Big";
	else if (Game.alertstyle == "Big")
		Game.alertstyle = "Small";		
	
	document.getElementById( "togglenotes").value = "Notifications: "+ Game.alertstyle;
	
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
		this.volmod = volmod;
		this.link;
	}
	
	var playlistsize = 6;
	playlistiter = Math.floor(Math.random() * playlistsize - 1);

	playlist = new Array();
	
	playlist.push(new Song("audio/ville_seppanen-1_g.mp3", "audio/mp3", 20, "Osmic", "Ville Seppanen", 1, "http://opengameart.org/content/space-ambient"));
	playlist.push(new Song("audio/Startrek.mp3", "audio/mp3", 30, "ender4life", "Star Trek Bridge Ambience", 1, "https://www.youtube.com/watch?v=dLrfdcz8Ou4&"));
	playlist.push(new Song("audio/Klaud 9 AGAIN.ogg", "audio/ogg", 154, "LySeRGe", "Klaud 9", 0.4, "https://soundcloud.com/memoske/klaud-9"));
	playlist.push(new Song("audio/Melancholics Anonymous - S3rge Rybak.mp3", "audio/mp3", 169, "LySeRGe", "Melancholics Anonymous", 0.5, "https://soundcloud.com/memoske/melancholics-anonymous"));
	playlist.push(new Song("audio/bells2_1.ogg","audio/ogg", 80, "p0ss", "Cuddle Puzzle", 0.6 ,"http://opengameart.org/content/cuddle-puzzle-music-futuristic-pop"));
	playlist.push(new Song("audio/Space Sprinkles.mp3", "audio/mp3", 120, "Matthew Pablo", "Space Sprinkles", 0.5 ,"http://www.matthewpablo.com/"));
	//playlist.push(new Song("audio/Aniline.mp3", "audio/mp3", 110, "Death of Sound", "Aniline", 0.6));
	//playlist.push(new Song("audio/Look at me.ogg", "audio/ogg", 120, "Death of Sound", "Look at me", 0.8));
	
		
	music = document.getElementById("music");
	
	music.addEventListener("ended", function()
	{
		playNextSong();
	});
	
	music.loop = false;
	music.volume = Game.vol;
	
	//this is immediately replaced with the appropriate BPM version, but we need it here because that function requires starting by removing it!
	musicsymbolnew = musicsymbol.clone({
		duration: 60*1000/120,
	});
	if (Game.musicplaying)
		playNextSong("init");
}

function playNextSong(init)
{
	if (init != "init")
	{		
		adjustRealVol("end", playlist[playlistiter].volmod); //end the previous songs volmod impact on html5 audio volume
	}
	playlistiter++;
	if (playlistiter > playlist.length-1)
		playlistiter = 0;
	
	var songobj = playlist[playlistiter];
	
	console.log(songobj.track);
	music.type = songobj.codec;
	music.src = songobj.track;	
		
	Game.musicplaying = false;
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
	if (Game.musicplaying == true) 
	{
		music.pause();
		musicsymbolnew.stopAnimation();
	}
	else
	{
		music.play();
		musicsymbolnew.startAnimation();
	}
	
	Game.musicplaying = !Game.musicplaying;
}

function adjustBPM()
{	
	music_text.removeChild(musicsymbolnew);

	musicsymbolnew = musicsymbol.clone({
		duration: 60*1000/playlist[playlistiter].bpm,
		frame: 2,
	});

	music_text.addChild(musicsymbolnew);
	musicsymbolnew.bind("click tap", function(){musicPress();});
}

function linkMusic()
{
	
}

}

//~~~~ Game Code ~~~~~
{
var ranges = [
  { divider: 1e147 , suffix: 'AV' },
  { divider: 1e144 , suffix: 'AU' },
  { divider: 1e141 , suffix: 'AT' },
  { divider: 1e138 , suffix: 'AS' },
  { divider: 1e135 , suffix: 'AR' },
  { divider: 1e132 , suffix: 'AQ' },
  { divider: 1e129 , suffix: 'AP' },
  { divider: 1e126 , suffix: 'AO' },
  { divider: 1e123 , suffix: 'AN' },
  { divider: 1e120 , suffix: 'AM' },
  { divider: 1e117 , suffix: 'AL' },
  { divider: 1e114 , suffix: 'AK' },
  { divider: 1e111 , suffix: 'AJ' },
  { divider: 1e108 , suffix: 'AI' },
  { divider: 1e105 , suffix: 'AH' },
  { divider: 1e102 , suffix: 'AG' },
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
var totalshots = 0;
var ctrlmod = false;
var oldclicklimit = new Date().getTime();


//initialise canvas
var dronestyle = {1:"sync", 2:"clock", 3:"anti", 4:"desync"};
var notearray = [];
var planetArray = [];
var tabNotification = [0, 0, 0];
var activecolour = "rgb(0, 170, 170)";
var inactivecolour = "rgb(0,119,119)";

initialiseCanvas();

//var activecolour = 'rgb(' + 12 + ',' + 192 + ',' + 204+ ')';
//var inactivecolour = 'rgb(' + 6 + ',' + 96 + ',' + 102 + ')';

function NewGame()
{
	this.gold = 0;
	this.gold = 0;
	this.goldpt = 0;
	this.goldmod = 1;
	this.goldupcost = 10;
	this.goldname = " Minerals";
	 
	this.miner = 0;
	this.minercost = 20;
	this.minercostrate = 1.1;
	this.minerpt = 0;
	this.minermod = 1;
	this.minerupcost = 1500;
	this.minername = " Crew";

	this.foreman = 0;
	this.foremancost = 40;
	this.foremancostrate = 1.15;
	this.foremanpt = 0;
	this.foremanmod = 1;
	this.foremanupcost = 25000;
	this.foremanname = " Asteroids";

	this.ship = 0;
	this.shipcost = 80;
	this.shipcostrate = 1.2;
	this.shippt = 0;
	this.shipmod = 1;
	this.shipupcost = 5000000000000;
	this.shipname = " Drones";

	this.science = 0;
	
	//positions
	this.shipspeed = 40;
	this.planetArrayit = 0;
	this.shipscanning = false;
	
	//upgrades
	this.goldbuy = 0;
	this.goldbuycost = 50;

	this.level = 0;
	this.levelcost = 1000;
	this.progress = 0;
	this.it = 0;
	this.longtick = 5;

	this.clicktype = "gold";
	this.minerclickcost = 400000000; //400 B asteroids
	
	this.droneclick = false;
	this.droneclickcost = 1000000000000; //10 C fuel
	
	this.beercost = 1500; //1.5 A fuel
	
	//settings
	this.displayProjectiles = true;
	this.dronestyle = 1;
	this.vol = 0.4;
	this.musicplaying = true;
	this.gameversion = "0.2.6";
	this.alertstyle = "Big";
	this.tutorialprogress = 0;
}

var Game = new NewGame();
var visibledrones = 0;
var delay = (1000 / tickspeed);
var now = new Date(), before = new Date(); 
var savetime;

var currentversion = "0.2.6";
var savefilechanged = false;

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
		if (Game.gameversion != currentversion)
		{
			swal
			(
				{
					title: "28/02/2016\n" + "v " + currentversion,
					text: "Updates:\n- Zone map\n- Progression longer\n- UI tweaks\n- Endgame crash fix",
					type: "info",
					confirmButtonText: "Thanks for letting me know",					
					closeOnConfirm: !savefilechanged,		
					align:"left"
				},
				function()
				{
					if (savefilechanged)
					{
						swal 
						(
							{
								title: "Delete save file?",
								text: "The game save file has been changed.\nAs this game is in heavy development your save file may be corrupted due to this update. \nIf you experience difficulties please delete your save file.",
								type: "warning",
								showCancelButton: true,   
								cancelButtonText: "No",
								confirmButtonText: "Yes",								
								closeOnConfirm: false,		
							},
							function()
							{
								deleteSave();		
							}
						);
					}
				}
			);
		}
		Game.gameversion = currentversion;
		//need to re-add the drones to canvas, just in case...
		resetDrones("onload");
		//load the last date and tell the user we were offline
		//dates act funny so can't be simply placed in game object
		savetime = new Date(parseInt(localStorage.getItem('time')));  
		
		//offline progression
		offlineticks();
		Game.shipscanning = false; //in case you load a save while you were scanning a planet
		
		console.log("Done with offline");		
	}
}
else
{
	if (Game.tutorialprogress < 1)
	{
		customNote(Game.alertstyle, "Welcome!", 
		"Click your ship or the \'Click\' button to mine fuel.", 0);
		Game.tutorialprogress++;
	}
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
	{
			for (var i = 0; i < elapsedTime/prograte; i++)
				Game.progress += changeprog;
	}
	else
	{
		if (!Game.shipscanning)
			Game.progress += changeprog;
	}
    progbefore = new Date();   

	oldprog = changeprog;
	
	levelup('online');
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

