from flask import Flask, render_template, request
from flask_rangerequest import RangeRequest
from flask_cors import cross_origin
from datetime import datetime
from os import path
from util import *

app = Flask(__name__)


FILE = "static/rosbag/all_sensors_for_so_verytcut_2023-01-07-VEH8-LVMS-RUN-6_0.mcap"
SIZE = path.getsize(FILE)
with open(FILE, 'rb') as f:
    ETAG = RangeRequest.make_etag(f)
LAST_MODIFIED=datetime.utcnow()

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/filter", methods=["POST"])
def filter_metadata():
    filters = []
    raw_filters = request.json["filters"]
    for f in raw_filters:
        match f["transformation"]:
            case "none":
                transform = None
            case "len":
                transform = len
        match f["type"]:
            case "exact":
                filters.append(
                    make_filter_for_metadata_attribute(
                        *f["attributes"], transform=transform, exact_value=f["value"]
                    )
                )

            case "range":
                begin = f["begin"] if f["begin"] != "" else None
                end = f["end"] if f["end"] != "" else None
                begin_inc = f["begin_inc"]
                end_inc = f["end_inc"]
                filters.append(
                    make_filter_for_metadata_attribute(
                        *f["attributes"],
                        transform=transform,
                        within_range=(begin, end),
                        range_inclusive=(begin_inc, end_inc),
                    )
                )
            case "set":
                filters.append(
                    make_filter_for_metadata_attribute(
                        *f["attributes"],
                        transform=transform,
                        value_set=set(f["values"]),
                    )
                )
    runs = list(filter_by_metadata(combine_metadata_filters(filters)))

    return {"runs": runs}

@app.route("/rosbag.mcap", methods=["GET", "POST"])
@cross_origin(origins="https://app.foxglove.dev", expose_headers=["ETag", "Content-Type", "Accept-Ranges", "Content-Length"])
def return_rosbag():
    return RangeRequest(
        open(FILE, "rb"),
        etag=ETAG,
        size=SIZE,
        last_modified=LAST_MODIFIED,
    ).make_response()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
