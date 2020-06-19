# Clockify-Appscript
Fetch task to clockify api from google sheet

1) puedes clonar la hoja de calculo desde este link https://docs.google.com/spreadsheets/d/11E5HFdo8AtNN_RNlI2MQYCSpfZkfTkSINeTYfFpAgag/edit?usp=sharing


configuración 

1)Generar la API-KEY de clockify desde el panel administración de tu cuenta clockify.

2)Establecer el time format en 24-hs (NO requerido/Recomendable).

3)Pegar esa key en la hoja datos celda B2.

4)Desde el menú "acciones" de la planilla de calculo ejecutar la función "Datos del usuario".

5)Seleccionar en la hoja datos el pais desde donde ejecutará el script, Ecuador o Argentina. (Proximamente se modificará este paso)

6)En la hoja carga celda B2 ingresar la fecha en la que pretende cargar la tarea formato dd/MM/aaaa (REQUERIDO).

7)Inresar hora inicio y fin de la tarea formato hh:mm (REQUERIDO)

8)Seleccionar el proyecto del unicamente del menú desplegable. (REQUERIDO)

9)Agregar la descripción de la tarea. (REQUERIDO)

10)Desde el menú "acciones" de la planilla de calculo ejecutar la función "Enviar tareas". Luego de este paso ya podremos visualisar las tareas en la web de clockify.

11)Desde el menú "acciones" de la planilla de calculo ejecutar la función "Archivar".

