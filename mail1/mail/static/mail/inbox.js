document.addEventListener('DOMContentLoaded', function() {

  // handlebar compile the email boxes
 var template = Handlebars.compile(document.querySelector('#template').innerHTML);

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox',template));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent',template));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive',template));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox',template);

  // form submission 
  document.querySelector('#compose-form').addEventListener("submit" , (event) => {
    event.preventDefault();
    console.log("starting email sending request");
    fetch('/emails',
    {
      method : 'POST',  
      body : JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })    
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        //console.log(result);
        load_mailbox('sent',template);
    });
  }); 

  
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
 

function load_mailbox(mailbox,template) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
        // Print result
        //console.log(emails);

        // if error
        if (emails.hasOwnProperty('error'))
        {
          console.log('mailbox not working correctly');
        }
        else
        {
          emails.forEach((email) => {
            
            const element = template({email_sender :email.sender, email_subject : email.subject,email_datetime : email.timestamp , email_id : email.id}); // thinking email_id would work as data element in template            
            //console.log(element);
            document.querySelector('#emails-view').innerHTML += element;
            const added_email =  document.querySelector('#emails-view').lastElementChild;
            console.log(added_email);
            if (email.read)
            {
              added_email.style.backgroundColor = 'lightgrey';
            }
            added_email.addEventListener('click', function(event) {
              if (event.target.parentNode.className === "email-box")
              {
                console.log("event.target.parentNode");
                console.log(event.target.parentNode);
                view_mail(event.target.parentNode)
              }
              else
              {
                console.log("event.target");
                console.log(event.target);  
                view_mail(event.target);
              }
            });
          })
        }
    });
  }


var mail = {sender:" ",recipents:"",subject:"",timestamp:"",body:""};

function view_mail(mail_div){
  let id = mail_div.dataset.id;
  fetch('/emails/' + id)
  .then(response => response.json())
  .then(email => {
      mail = email;
      //console.log("var mail = ");  
      //console.log(window.mail); 
      tick();
      // show only email-view
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'block';
      if (!email.read)
      {
        fetch('/emails/' + id, {
        method: 'PUT',
        body: JSON.stringify({
          read : true
        })
      })
      }  
  })    
}

function archive(id){
    //console.log("archive function is called");
    
    fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
      })
    })

    load_mailbox('archive',template);
}