import got from "got";

import _metascraper from "metascraper";
import title from "metascraper-title";
import image from "metascraper-image";
import author from "metascraper-author";
import date from "metascraper-date";
import description from "metascraper-description";
import logo from "metascraper-logo";
import instagram from "metascraper-instagram";
import twitter from "metascraper-twitter";
import url from "metascraper-url";

const metascraper = _metascraper([
  title(),
  image(),
  author(),
  date(),
  description(),
  logo(),
  instagram(),
  twitter(),
  url()
]);

try {
  // Use the got library to fetch the website content.
  const targetUrl = "https://www.instagram.com/reel/C043dgyS2e6/?igsh=MXY3MHZkcmVuOWQ0dw==";
  const { body: html, url } = await got(targetUrl);
  console.log(html.includes('mp4'))
  // Extract the metadata from the website content.
  const metadata = await metascraper({ html, url });

  // Return the metadata as JSON
  // console.log(metadata);
} catch (err) {
  console.log(err);
}