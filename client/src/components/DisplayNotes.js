import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { CardColumns, Modal, Button } from 'react-bootstrap';

import NoteCard from './NoteCard';

import axios from '../utils/axios';

// This component displays the notes inside the notes container
class DisplayNotes extends Component {
  static propTypes = {
    history: PropTypes.instanceOf(Object).isRequired,
    match: PropTypes.instanceOf(Object).isRequired,
    // Type [note/grp/folder]
    type: PropTypes.string.isRequired,
    // User's root folder
    userRootFolder: PropTypes.string.isRequired,
    // Visiblity for the folder
    visibility: PropTypes.number.isRequired
  };

  state = {
    // Store the notes
    contentArray: [],
    // State if confirmation modal should be opened or closed
    isConfirmDeleteOpen: false,
    // Stores the id of the note/folder to be deleted
    toBeDeleted: null
  };

  /*
   * It is called when cotent needs to be updated
   *
   * It first clears the current content
   * Then, fetches the new content and updates the list
   */
  getContent = () => {
    // Clear current list
    this.setState({ contentArray: [] });

    // Assume root folder
    let folder = this.props.userRootFolder;
    // Update the folder if not root
    const _id = this.props.match.params.id;
    if (_id) folder = _id;
    // Get the new content
    axios()
      .get(`/${this.props.type}s/get/${folder}`)
      // Update the state to show the fetched data
      .then(res => this.setState({ contentArray: res.data }));
  };

  /*
   * Called when component updates
   *
   * If the id of the folder changes,
   * call the `getContent()` to update the content
   */
  componentDidUpdate = prevProps => {
    // If folder id changes, update the content
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.getContent();
    }
  };

  // When the component mounts, call the `getContent()` to update the content
  componentDidMount = () => {
    this.getContent();
  };

  // It returns the clicked node if it's either note card/note delete button
  getCardIfClicked = node => {
    while (node) {
      if (
        node.classList.contains('card') ||
        node.classList.contains('btn-delete')
      )
        return node;
      node = node.parentElement;
    }
    return null;
  };

  // Show delete confirmation modal
  confirmAndDelete = _id => {
    this.setState({ toBeDeleted: _id, isConfirmDeleteOpen: true });
  };

  // Delete the content specified
  deleteContent = _id => {
    if (!_id) return;
    const index = parseInt(_id, 10);
    const { id } = this.state.contentArray[index];
    // Send the delete request
    axios()
      .delete(`/${this.props.type}s/delete/${id}`)
      .then((/* res */) => {
        this.setState(prevState => {
          prevState.contentArray.splice(index, 1);
          return {
            contentArray: prevState.contentArray,
            toBeDeleted: null,
            isConfirmDeleteOpen: false
          };
        });
      })
      .catch((/* err */) => {
        // TODO: Notify user of the error
      });
  };

  // Close delete confirmation modal
  closeDeleteConfirmation = () => {
    this.setState({ toBeDeleted: null, isConfirmDeleteOpen: false });
  };

  /*
   * When the card column is clicked, this is called
   *
   * It recieves the node if it is the note card or it's delete button.
   * Then according to the node-
   * 1. If card clicked, open the note to view/edit
   * 2. If delete button clicked, delete the note
   */
  handleCardColumnClick = node => {
    // Get the node, if either of them clicked
    const clicked = this.getCardIfClicked(node);
    // If either of them is clicked, go ahead
    if (clicked) {
      switch (clicked.nodeName) {
        // If the card is clicked, open the card
        case 'DIV': {
          const item = this.state.contentArray[parseInt(clicked.id, 10)];
          // Route to opening the note
          this.props.history.push(`/${this.props.type}s/open/${item.id}`);
          break;
        }
        // If the button is clicked, delete the button
        case 'BUTTON':
          this.confirmAndDelete(clicked.id);
          break;
        default:
          break;
      }
    }
  };

  render() {
    return (
      <>
        <CardColumns
          className="h-100"
          onClick={e => this.handleCardColumnClick(e.target)}
        >
          {/*
           * Show the fetched notes
           */}
          {this.state.contentArray.map((item, index) => (
            <NoteCard
              key={item.id}
              id={index.toString()}
              type={this.props.type}
              title={item.title || item.name}
              updated={item.timestamp}
              visibility={this.props.visibility}
            />
          ))}
        </CardColumns>
        {/* Modal for delete confirmation */}
        <Modal
          show={this.state.isConfirmDeleteOpen}
          onHide={this.closeDeleteConfirmation}
        >
          <Modal.Header>
            <Modal.Title>Confirm delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete?</Modal.Body>
          <Modal.Footer>
            {/* Cancel deletion */}
            <Button
              variant="outline-secondary"
              onClick={this.closeDeleteConfirmation}
            >
              Oops! Go back
            </Button>
            {/* Confirmation deletion */}
            <Button
              variant="danger"
              onClick={() => this.deleteContent(this.state.toBeDeleted)}
            >
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

// Get the required props from the state
const mapStateToProps = state => {
  return {
    userRootFolder: state.user.root
  };
};

export default withRouter(connect(mapStateToProps)(DisplayNotes));
