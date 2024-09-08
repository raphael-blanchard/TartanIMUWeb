from flask import Flask, render_template, request
from util import *

app = Flask(__name__)


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


@app.route("/runs")
def runs():
    return render_template("runs.html")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
