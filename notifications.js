function customNote(style, message, text)
{

	if (style === "note")
	{
		titlenotifier.add();
		Notifier.info(text, message);
	}
	else if (style == "swal")
	{
		swal(
		{
			title: message,
			text: text,
			confirmButtonText: "Ok!",
			confirmButtonColor: "#004444"
		});
	}
}