function customNote(style, title, text)
{

	if (style === "Small")
	{
		titlenotifier.add();
		Notifier.info(text, title);
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