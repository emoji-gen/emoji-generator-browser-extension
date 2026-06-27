import { load } from "cheerio";
import v from "voca";

export interface ITeam {
  name: string;
  teamdomain: string;
}

export interface IResult {
  ok: boolean;
  error: string;
}

export async function searchJoinedTeams(): Promise<ITeam[]> {
  const res = await fetch("https://slack.com/signin", {
    credentials: "include",
  });
  if (_DEBUG) {
    console.log(res);
  }

  const body = await res.text();
  const $ = load(body);
  const propsNode = $("#props_node");
  const propsText = propsNode.attr("data-props");
  if (!propsText) {
    return [];
  }

  let props;
  try {
    props = JSON.parse(propsText);
    if (_DEBUG) {
      console.log("props", props);
    }
  } catch (e) {
    if (_DEBUG) {
      console.error("Unable to parse JSON", propsText);
    }
    return [];
  }

  if (!props) {
    return [];
  }
  if (!props.loggedInTeams) {
    return [];
  }

  const loggedInTeams: [{ [key: string]: string }] = props.loggedInTeams;
  return loggedInTeams
    .map((team) => {
      if (team.is_enterprise) {
        return;
      }
      if (!team.team_name) {
        return;
      }
      if (!team.team_domain) {
        return;
      }

      return {
        name: team.team_name,
        teamdomain: team.team_domain,
      };
    })
    .filter((team) => !!team) as ITeam[];
}

export async function registerEmoji(
  url: string,
  text: string,
  teamdomain: string,
): Promise<void> {
  if (!url) {
    throw "Invalid Emoji URL";
  }

  // fetch emoji image data
  const image = await fetch(url, {
    credentials: "include",
  });
  const imageData = await image.blob();
  if (_DEBUG) {
    console.log(image);
  }

  // fetch initial form data
  const initialUrl = `https://${teamdomain}.slack.com/customize/emoji`;
  const initialResponse = await fetch(initialUrl, {
    credentials: "include",
  });
  if (_DEBUG) {
    console.log(initialResponse);
  }

  // Find API token
  const initialText = await initialResponse.text();
  const tokenRegex = /api_token["']?\s*:\s*["']([\w-]+)["']/;
  const tokenMatches = tokenRegex.exec(initialText);
  const token = tokenMatches ? tokenMatches[1] : null;
  if (!token) {
    throw "API token not found";
  }
  if (_DEBUG) {
    console.log(token);
  }

  // create post form data
  const fd = new FormData();
  fd.append("mode", "data");
  fd.append("name", text);
  fd.append("image", imageData, "emoji.png");
  fd.append("token", token);

  // Add emoji
  const addUrl = `https://${teamdomain}.slack.com/api/emoji.add`;
  const addResponse = await fetch(addUrl, {
    body: fd,
    credentials: "include",
    method: "POST",
  });
  if (_DEBUG) {
    console.log(addResponse);
  }

  // Parse adding result
  const resultJson = await addResponse.text();
  let result: IResult;
  try {
    result = JSON.parse(resultJson);
  } catch (e) {
    throw "Invalid JSON syntax";
  }

  if (result.ok) {
    return;
  }
  throw result.error || "Unknown Error";
}
