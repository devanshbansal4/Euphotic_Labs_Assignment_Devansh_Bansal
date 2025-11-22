Goodmorning, I'm Devansh Bansal. 
This is the assignment.

Its been uploaded within its virtual environment, so its ready to be run.

Steps to run :: 

1) In the root folder run these commands in the terminal ::
    cd backend
    npm start

2) In the root folder then run these ::
     cd frontend
     npm start

3) The dashboard should run smoothly.
   
4) Use the toggle button to flip status between Published and Unpublished.


## Bonus Feature
To see the dynamic nature of the webpage :: 
1) Make the changes using the backend by opening the terminal inside backend directory.
2) Use commands ::
      sqlite3 dishes.db
      If the status is Published, use query :: Update dishes set isPublished=0 where dishId=2
      Else :: Update dishes set isPublished=1 where dishId=2
   You will see that the status on the dashboard changes automatically, because the page is dynamic.



## "Code_Walkthrough_Devansh_Bansal.mp4" and "Demo_Devansh_Bansal.mp4" are the videos explaining the code adn showing the demo respectively. 
