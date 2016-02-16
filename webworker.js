var tickspeed = 2;
var delay = 1000/tickspeed;
var gameslow = tickspeed * 1.6;

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
	
	this.tab = "here";
	
}

onmessage = function(e)
{
	var Game = e;
	
	var now = new Date(), before = new Date(); 
	
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
				tick();
				Game.tab = 'away';
			}
		}	
		else
		{
			tick();
			Game.tab = 'here';
		}
		before = new Date();   

		postMessage(JSON.stringify(Game));
		
	}, delay);		
}

function tick()
{
	var modifierB = gameslow;	
	if (Game.droneclick)
		for (var i = 0; i < visibledrones; i++)
			count("drone");
	
	Game.gold += Game.goldpt/modifierB;
	Game.miner += Game.minerpt/modifierB;
	Game.foreman += Game.foremanpt/modifierB;

	Game.goldpt = Game.miner * Game.minermod;
	Game.minerpt = Game.foreman * Game.foremanmod;	
	Game.foremanpt = Game.ship * Game.shipmod;	

}

function count() 
{
	if (Game.clicktype == "gold")
	{
		Game.gold += 1*Game.goldmod;
	}
	else if (Game.clicktype == "miner")
	{
		Game.gold += 1*Game.goldmod;
		
		Game.miner += 0.1*Game.goldmod;
	}
} 
