from flask import jsonify
from mongoengine import EmbeddedDocument, Document, QuerySet
from mongoengine.queryset.queryset import QuerySet
from collections.abc import Mapping
from bson import ObjectId
import datetime

def serialize_doc(doc):
    if isinstance(doc, (QuerySet, list)):
        return [serialize_doc(item) for item in doc]

    # Handle MongoEngine Document or EmbeddedDocument
    if isinstance(doc, (Document, EmbeddedDocument)):
        doc_dict = dict(doc.to_mongo())  # convert SON → dict
    elif isinstance(doc, Mapping):  # plain dict or SON
        doc_dict = {k: serialize_doc(v) for k, v in doc.items()}
    else:
        return doc  # primitives

    # Convert _id to string
    if "_id" in doc_dict:
        doc_dict["id"] = str(doc_dict["_id"])
        doc_dict.pop("_id", None)

    # Recursively convert values
    for k, v in doc_dict.items():
        if isinstance(v, ObjectId):
            doc_dict[k] = str(v)
        elif isinstance(v, datetime.datetime):
            doc_dict[k] = v.isoformat()
        elif isinstance(v, (Document, EmbeddedDocument, dict, list, Mapping)):
            doc_dict[k] = serialize_doc(v)

    return doc_dict

def make_response(data=None, msg="", status_code=200):
    response = {
        "data": serialize_doc(data) if data else {},
        "msg": msg,
        "statusCode": status_code
    }
    return jsonify(response), status_code
