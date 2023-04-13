import axios from "axios";

const googleDrive = {};

googleDrive.getMediaLink = async function (docId) {
  try {
    const thumbnail = await axios
      .get(`https://drive.google.com/thumbnail?sz=w1000&id=${docId}`, {
        maxRedirects: 0,
      })
      .catch((error) => {
        return error.response.headers.location;
      });

    const resData = await axios.get(`https://drive.google.com/uc?id=${docId}&export=download`, {
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    if (resData.status === 200) {
    } else if (resData.status === 303) {
      const u = new URL(resData.headers.location);
      if (u.hostname?.endsWith("googleusercontent.com")) {
        return createSuccessResponse(resData.headers.location, thumbnail);
      } else {
        return createFailedResponse(401, "Unauthorized");
      }
    } else {
      return createFailedResponse(resData.status, {
        statusText: resData.statusText,
        headers: resData.headers,
      });
    }

    const responseCookies = resData.headers["set-cookie"] || "";
    const cookies = responseCookies.split(";").map((x) => x.trim());

    const formElement = document.createElement("div");
    formElement.innerHTML = resData.data;
    const nextActionURL = formElement.querySelector("form").getAttribute("action");

    const postData = new URLSearchParams();
    postData.append("docid", docId);

    const reqMediaConfirm = await axios.post(nextActionURL, postData.toString(), {
      headers: {
        cookie: cookies,
      },
      maxRedirects: 0,
    });

    const videoSource = reqMediaConfirm.headers.location;
    const thumbSource = thumbnail || "";

    return createSuccessResponse(videoSource, thumbSource);
  } catch (error) {
    throw new Error("Error while fetching the media link. " + error.message);
  }
};

function createFailedResponse(status, error) {
  return {
    statusCode: status,
    error: error,
  };
}

function createSuccessResponse(videoSource, thumbSource) {
  return {
    src: videoSource,
    thumbnail: thumbSource,
  };
}

export default googleDrive;
