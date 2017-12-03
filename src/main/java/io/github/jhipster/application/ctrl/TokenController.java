package io.github.jhipster.application.ctrl;

import com.ibm.watson.developer_cloud.http.ServiceCall;
import com.ibm.watson.developer_cloud.speech_to_text.v1.SpeechToText;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TokenController {

    @GetMapping("/token")
    public String getToken() {
        SpeechToText stt = new SpeechToText("3d542172-5957-437c-a81d-36148b950651", "bUQz6kWUJP2u");
        stt.setEndPoint("https://stream.watsonplatform.net/speech-to-text/api");
        final ServiceCall<String> token = stt.getToken();
        return token.execute();
    }
}
