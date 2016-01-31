var gold = 0;
var goldpt = 0;
var goldmod = 1;
var goldupcost = 10;
 
var miner = 0;
var minercost = 15;
var minerpt = 0;
var minermod = 1;
var minerupcost = 2000;
 
var foreman = 0;
var foremancost = 10;
var foremanpt = 0;
var foremanmod = 1;
var foremanupcost = 25000;

var shipx;
var shipy = 1;

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
	document.getElementById( "goldbutton").value = "Click        " + "+ " + goldmod + " gold";
	document.getElementById( "foremanbutton").value = "Foremans        " + "Costs " + foremancost + " miners";
	document.getElementById( "minerbutton").value = "Miners        " + "Costs " + minercost + " gold";

	document.getElementById( "goldupgradebutton").value = "Upgrade Clicks        " + "Costs " + goldupcost + " gold";
	document.getElementById( "minerupgradebutton").value = "Upgrade Miners        " + "Costs " + minerupcost + " gold";
	document.getElementById( "foremanupgradebutton").value = "Upgrade Foreman        " + "Costs " + foremanupcost + " gold";
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
	if ( miner >= foremancost * 0.5)
	{
		document.getElementById( "foremans").style.visibility = "visible";
		document.getElementById("foremanbutton").style.visibility = "visible";
		document.getElementById("minerspt").style.visibility = "visible";

	}
	if (gold >= minercost)
	{
		document.getElementById("miners").style.visibility = "visible";
		document.getElementById("minerbutton").style.visibility = "visible";
		document.getElementById( "goldpt").style.visibility = "visible";
	}
}

function updateAmounts()
{
	document.getElementById( "gold" ).value = Math.round(gold);	
	document.getElementById( "miners" ).value = Math.round(miner);	
	document.getElementById( "foremans" ).value = Math.round(foreman);
	
	document.getElementById( "goldpt" ).value = Math.round(goldpt);	
	document.getElementById( "minerspt" ).value = Math.round(minerpt);	
	document.getElementById( "foremanspt" ).value = Math.round(foremanpt);
	
	goldpt = miner * minermod;
	minerpt = foreman * foremanmod;	
}

function tick()
{
	
	gold += goldpt/100;	
	progress += goldpt/100;
	
	miner += minerpt/100;
	
	shipx = Math.floor(progress/levelcost * canvas.width);
	
	if (progress + 25 > levelcost)
	{
		shipy++;
		progress = 0;
		levelcost *= 2;
	}

	updateAmounts();		
	checkVisibility();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawScreen();

}
function count() 
{
	progress += 1*goldmod;
	gold += 1*goldmod;
	document.getElementById( "gold" ).value = Math.round(gold);	
}
 
function buyminer()
{
	if (gold >= minercost)
	{
		gold -= minercost;			
		miner += 1;			
		minercost *= 1.2;
		minercost = Math.round(minercost);
		document.getElementById( "minerbutton").value = "Miners        " + "Costs " + minercost + " gold";
		
		
		updateAmounts();		
	}
 }
 
function buyforeman()
{
	if (miner >= foremancost)
	{
		miner -= foremancost;
		foreman += 1;		
		foremancost *= 1.5;
		foremancost = Math.round(foremancost);
		document.getElementById( "foremanbutton").value = "Foremans        " + "Costs " + foremancost + " miners";
					
		updateAmounts();		
	}

 }
 
function upgrade(id)
{
	if (id == "gold" && gold >= goldupcost)
	{
		gold -= goldupcost;
		goldupcost *= 12;
		goldmod *=3;
		document.getElementById( "goldbutton").value = "Click        " + "+ " + goldmod + " gold";
		document.getElementById( "goldupgradebutton").value = "Upgrade Clicks        " + "Costs " + goldupcost + " gold";
	}	
	if (id == "miner" && gold >= minerupcost)
	{
		gold -= minerupcost;
		minerupcost *= 3;
		minermod *= 1.3;
		goldpt = miner * minermod;
		document.getElementById( "minerupgradebutton").value = "Upgrade        " + minermod + "\n" + "Costs " + minerupcost + " gold";

	}
	if (id == "foreman" && gold >= foremanupcost)
	{
		gold -= foremanupcost;
		foremanupcost *= 3;
		foremanmod *= 1.3;
		minerpt = foreman * foremanmod;
		document.getElementById( "foremanupgradebutton").value = "Upgrade        " + foremanmod + "\n" + "Costs " + foremanupcost + " gold";
	}
	
	updateAmounts();		
}

function drawShip()
{
	var img = document.getElementById("ship1");
	ctx.drawImage(img, shipx, shipy, 50, 50);	
}
function drawScreen()
{
	drawShip();
	
	ctx.font = "30px Arial";
	ctx.fillText("Level" + shipy,100,100);

}