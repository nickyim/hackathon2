from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy
from enum import Enum as PyEnum

db = SQLAlchemy()

# Enum for FileType
class FileType(PyEnum):
    TEXT = 'TEXT'
    IMAGE = 'IMAGE'
    VIDEO = 'VIDEO'
    AUDIO = 'AUDIO'
    JSON = 'JSON'# User Model

class User(db.Model):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True, autoincrement=True)
    clerkId = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    
    entries = relationship('Entry', backref='user', lazy=True)
    files = relationship('File', backref='user', lazy=True)

# Entry Model
class Entry(db.Model):
    __tablename__ = 'entry'
    id = Column(Integer, primary_key=True, autoincrement=True)
    entryId = Column(String, unique=True, nullable=False)
    isComplaint = Column(Boolean, nullable=False)
    product = Column(String)
    subProduct = Column(String)
    issue = Column(String)
    subIssue = Column(String)
    entryText = Column(Text, nullable=False)
    summary = Column(String)
    dateSentToCompany = Column(DateTime)
    dateReceived = Column(DateTime)
    company = Column(String)
    companyResponse = Column(String)
    companyPublicResponse = Column(String)
    consumerDisputed = Column(String)
    consumerConsentProvided = Column(String)
    state = Column(String)
    zipCode = Column(String)
    submittedVia = Column(String)
    tags = Column(String)
    timely = Column(Boolean)
    productCategory = Column(String)
    subProductCategory = Column(String)
    vectorId = Column(String)
    userId = Column(Integer, ForeignKey('user.id'), nullable=False)
    
    files = relationship('File', backref='entry', lazy=True)

# File Model
class File(db.Model):
    __tablename__ = 'file'
    id = Column(Integer, primary_key=True, autoincrement=True)
    url = Column(String, nullable=False)
    type = Column(Enum(FileType), nullable=False)
    entryId = Column(Integer, ForeignKey('entry.id'), nullable=False)
    userId = Column(Integer, ForeignKey('user.id'), nullable=False)
