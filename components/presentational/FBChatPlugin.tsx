import { fetcher } from "@/util/fetcher";
import Script from "next/script";
import React from "react";
import useSWR from "swr";

export default function FBChatPlugin() {
  const { data } = useSWR("/api/configurations", fetcher);

  return (
    <div>
      <div id="fb-root"></div>
      {data && data.facebookPlugin && (
        <>
          <div id="fb-customer-chat" className="fb-customerchat"></div>
          <Script strategy="lazyOnload" id="fbChat">
            {`
            var chatbox = document.getElementById('fb-customer-chat');
            chatbox.setAttribute("page_id", ${data.facebookPlugin});
            chatbox.setAttribute("attribution", "biz_inbox");
            chatbox.setAttribute("theme_color", "#E71D2A");
            chatbox.setAttribute("logged_in_greeting", "Hello and thanks for getting in touch with us! What can we help you with today?")
      
            window.fbAsyncInit = function() {
              FB.init({
                xfbml            : true,
                version          : 'v13.0'
              });
            };
      
            (function(d, s, id) {
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) return;
              js = d.createElement(s); js.id = id;
              js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
              fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        `}
          </Script>
        </>
      )}
    </div>
  );
}
