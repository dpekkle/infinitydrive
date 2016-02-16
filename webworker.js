var tickspeed = 2;
var delay = 1000/tickspeed;
var gameslow = tickspeed * 1.6;

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
