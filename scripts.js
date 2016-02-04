var ranges = [
  { divider: 1e18 , suffix: 'P' },
  { divider: 1e15 , suffix: 'E' },
  { divider: 1e12 , suffix: 'T' },
  { divider: 1e9 , suffix: 'G' },
  { divider: 1e6 , suffix: 'M' },
  { divider: 1e3 , suffix: 'k' }
];

var gold = 0;
var goldpt = 0;
var goldmod = 1;
var goldupcost = 10;
 
var miner = 0;
var minercost = 20;
var minerpt = 0;
var minermod = 1;
var minerupcost = 1500;
 
var foreman = 0;
var foremancost = 15;
var foremanpt = 0;
var foremanmod = 1;
var foremanupcost = 25000;

var ship = 0;
var shipcost = 10;
var shippt = 0;
var shipmod = 2;
var shipupcost = 1000000;

//upgrades
var goldbuy = 0;
var goldbuycost = 100;

var shipx;
var shipy = 1;
var shipdy = 5;

// canvas element and "controller"
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var progress = 0;
var levelcost = 720;

//window.onload = drawShip;

initialiseCosts();
var mainLoop = setInterval(tick, 10);
	
function initialiseCosts()
{
	//set first two elements to be visible
	document.getElementById( "goldbutton").style.visibility = "visible";
	document.getElementById( "gold").style.visibility = "visible";

	//give values to the buttons based off of javascript variables
	document.getElementById( "goldbutton").value = "Click  " + "+ " + goldmod + " gold";
	document.getElementById( "foremanbutton").value = "Foremans  " + "Costs " + foremancost + " miners";
	document.getElementById( "minerbutton").value = "Miners  " + "Costs " + minercost + " gold";
	document.getElementById( "shipbutton").value = "Ships  " + "Costs " + shipcost + " foremen";

	document.getElementById( "goldupgradebutton").value = "Upgrade Clicks  " + "Costs " + goldupcost + " gold";
	document.getElementById( "minerupgradebutton").value = "Upgrade Miners  " + "Costs " + minerupcost + " gold";
	document.getElementById( "foremanupgradebutton").value = "Upgrade Foremen  " + "Costs " + foremanupcost + " gold";
	document.getElementById( "shipupgradebutton").value = "Upgrade Ships  " + "Costs " + shipupcost + " gold";

}

function checkVisibility()
{
	if (gold >= goldupcost * 0.5)
	{
		document.getElementById( "goldupgradebutton").style.visibility = "visible";
	}
	if (gold >= foremanupcost * 0.5 && document.getElementById( "foremans").style.visibility == "visible")
	{
		document.getElementById( "foremanupgradebutton").style.visibility = "visible";
	}
	if ( gold >= minerupcost * 0.5 && document.getElementById("miners").style.visibility == "visible")
	{
		document.getElementById("minerupgradebutton").style.visibility = "visible";

	}	
	
	if (gold >= shipupcost * 0.5 && document.getElementById("ships").style.visibility == "visible" )
	{
		document.getElementById("shipupgradebutton").style.visibility = "visible";
	}
	
	if ( miner >= foremancost * 0.5)
	{
		document.getElementById( "foremans").style.visibility = "visible";
		document.getElementById("foremanbutton").style.visibility = "visible";
		document.getElementById("minerspt").style.visibility = "visible";

	}
	
	if (foreman >= shipcost * 0.5)
	{
		document.getElementById( "ships").style.visibility = "visible";
		document.getElementById("shipbutton").style.visibility = "visible";
		document.getElementById("foremanspt").style.visibility = "visible";		
		
	}
	
	if (gold >= minercost)
	{
		document.getElementById("miners").style.visibility = "visible";
		document.getElementById("minerbutton").style.visibility = "visible";
		document.getElementById( "goldpt").style.visibility = "visible";
	}
	
	if (ship >= goldbuycost * 0.5 && goldbuy == 0)
	{
		document.getElementById("goldbuy").style.visibility = "visible";
	}
}

function updateAmounts()
{
	document.getElementById( "gold" ).value = formatNumber(gold);	
	document.getElementById( "miners" ).value = formatNumber(miner);	
	document.getElementById( "foremans" ).value = formatNumber(foreman);
	document.getElementById( "ships" ).value = formatNumber(ship);
	
	document.getElementById( "goldpt" ).value = formatNumber(goldpt);	
	document.getElementById( "minerspt" ).value = formatNumber(minerpt);	
	document.getElementById( "foremanspt" ).value = formatNumber(foremanpt);
	document.getElementById( "shipspt" ).value = formatNumber(shippt);
	
	goldpt = miner * minermod;
	minerpt = foreman * foremanmod;	
	foremanpt = ship * shipmod;	
	
}

function updateCosts()
{
	document.getElementById( "minerbutton").value = "Miners  " + "Costs " + formatNumber(minercost) + " gold";

	
	if (goldbuy == 1)
	{
		document.getElementById( "foremanbutton").value = "Foremans  " + "Costs " + formatNumber(foremancost) + " gold";
		document.getElementById( "shipbutton").value = "Ships  " + "Costs " + formatNumber(shipcost) + " gold";
	}
	else
	{
		document.getElementById( "foremanbutton").value = "Foremans  " + "Costs " + formatNumber(foremancost) + " miners";
		document.getElementById( "shipbutton").value = "Ships  " + "Costs " + formatNumber(shipcost) + " foreman";
	}
	
	//upgrade costs
	document.getElementById( "goldbutton").value = "Click  " + "+ " + formatNumber(goldmod) + " gold";
	document.getElementById( "goldupgradebutton").value = "Upgrade Clicks  " +  "\nCosts " + formatNumber(goldupcost) + " gold";
	document.getElementById( "minerupgradebutton").value = "Upgrade Miners  " + minermod + "\nCosts " + formatNumber(minerupcost) + " gold";
	document.getElementById( "foremanupgradebutton").value = "Upgrade Foremen  " + foremanmod + "\nCosts " + formatNumber(foremanupcost) + " gold";
	document.getElementById( "shipupgradebutton").value = "Upgrade Ships  " + shipmod + "\nCosts " + formatNumber(shipupcost) + " gold";

	
}

function tick()
{
	
	gold += goldpt/100;	
	progress += goldpt/100;
	miner += minerpt/100;
	foreman += foremanpt/100;
	
	shipx = Math.floor(progress/levelcost * canvas.width);
	
	if (shipx > canvas.width - 50)
	{
		shipy += shipdy;
		progress = 0;
		levelcost *= 2;
	}

	updateAmounts();
	updateCosts();	
	checkVisibility();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawScreen();

}
function count() 
{
	progress += 1*goldmod;
	gold += 1*goldmod;
}
 
 
 function buyunit(id)
 {
	if (id == "miner")
		buyminer(goldbuy);
	else if (id == "foreman")
		buyforeman(goldbuy);
	else if (id == "ship")
		buyship(goldbuy);	
 }
function buyminer(goldbuy)
{
	if (gold >= minercost)
	{
		gold -= minercost;
		miner += 1;			
		minercost *= 1.2;
		minercost = Math.round(minercost);
		
		updateAmounts();		
	}
 }
 
function buyforeman(goldbuy)
{
	var currency;
	if (goldbuy == 1)
		currency = gold;
	else
		currency = miner;

	if (currency >= foremancost)
	{
		if (goldbuy == 1)
			gold -= foremancost;		
		else
			miner -= foremancost;
		
		foreman += 1;		
		foremancost *= 1.3;
		foremancost = Math.round(foremancost);
					
		updateAmounts();		
	}

 }
 
 function buyship(goldbuy)
{
	var currency;
	if (goldbuy == 1)
		currency = gold;
	else
		currency = foreman;

	if (currency >= shipcost)
	{
		if (goldbuy == 1)
			gold -= shipcost;		
		else
			foreman -= shipcost;
		
		ship += 1;		
		shipcost *= 1.1;
		shipcost = Math.round(shipcost);
						
		updateAmounts();		
	}

 }
 
function upgrade(id)
{
	if (id == "gold" && gold >= goldupcost)
	{
		gold -= goldupcost;
		goldupcost *= 7.5;
		goldmod *=4;
	}	
	if (id == "miner" && gold >= minerupcost)
	{
		gold -= minerupcost;
		minerupcost *= 3;
		minermod *= 1.3;
		minermod = Math.floor(minermod * 100)/100;
		goldpt = miner * minermod;

	}
	if (id == "foreman" && gold >= foremanupcost)
	{
		gold -= foremanupcost;
		foremanupcost *= 3;
		foremanmod *= 1.3;
		foremanmod = Math.floor(foremanmod * 100)/100;

		minerpt = foreman * foremanmod;
	}
	
	if (id == "ship" && gold >= shipupcost)
	{
		gold -= shipupcost;
		shipupcost *= 3;
		shipmod *= 1.3;
		shipmod = Math.floor(shipmod * 100)/100;

		minerpt = ship * shipmod;
	}
	
	if (id == "goldbuy")
	{
		if (goldbuy == 0 && ship >= goldbuycost)
		{
			ship -= goldbuycost;
			goldbuy = 1;
			document.getElementById( "goldbuy" ).value = "Goldbuying units enabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#7FFF00"
		}
		else if (goldbuy == 1)
		{
			goldbuy = 2;
			document.getElementById( "goldbuy" ).value = "Goldbuying units disabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#FFFFFF"
			
		}	
		else if (goldbuy == 2)
		{
			goldbuy = 1;
			document.getElementById( "goldbuy" ).value = "Goldbuying units enabled";

			document.getElementById( "goldbuy").style.backgroundColor = "#7FFF00"		
		}
	}
	
	updateAmounts();		
}

// number handling

function round(x)
{
	var y = Math.floor(x);
	return y;
}

function formatNumber(n) {
  for (var i = 0; i < ranges.length; i++) 
  {
    if (n >= ranges[i].divider) 
	{
		var temp = (n / ranges[i].divider);
		temp = Math.floor(temp*1000)/1000;
		if ((temp * 1000)%10 == 0)
		{
			if ((temp * 100)%10 == 0)
				return temp.toString() + "00 " + ranges[i].suffix;
			else
				return temp.toString() + "0 " + ranges[i].suffix;
		}
		else
			return temp.toString() + " " + ranges[i].suffix;
    }
  }
  
  var temp = Math.floor(n);
  return temp.toString();
}

// canvas drawing
function drawShip()
{
	var img = document.getElementById("ship1");
	
	for (i = 0; i < Math.sqrt(ship) + 1; i++)
	{
		ctx.drawImage(img, shipx - (i*20), shipy , 50, 50);		
	}
}
function drawScreen()
{
	drawShip();
	
	ctx.font = "30px Times New Roman";
	ctx.fillText("Level" + Math.ceil(shipy/shipdy),0,610);

}