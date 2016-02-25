function customNote(style, title, text, img)
{
	
	if (style === "Small")
	{
		titlenotifier.add();
		if (img === 0)
		{
			Notifier.info(text, title, true);		console.log("A");
		}
		else
		{
			Notifier.notify(text, title, img, false);		console.log("B");
		}
		console.log(img);
		return document.getElementById(title + "note");
	}
	else if (style == "Big")
	{
		swal(
		{
			title: title,
			text: text,
			confirmButtonText: "Ok!",
			confirmButtonColor: "#004444"
			//test
		});
	}
}