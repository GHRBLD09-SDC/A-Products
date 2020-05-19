import React from 'react';
import axios from 'axios';

class StyleSelector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      addedToCart: null,
      selectedSku: null, // size
      qtyOptions: null,
      selectedQty: null,
      activeDropdown: null
    }
    this.styleClick = this.styleClick.bind(this);
    this.selectSize = this.selectSize.bind(this);
    this.selectQty = this.selectQty.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.toggleSelector = this.toggleSelector.bind(this);
    this.handleOutsideDropdown = this.handleOutsideDropdown.bind(this);
    this.closePopup = this.closePopup.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedStyle.style_id !== this.props.selectedStyle.style_id) {
      this.setState({ selectedSku: null, selectedQty: null})
    }
  }
  
  // update selected style when clicking on thumbnail
  styleClick(e) {
    this.props.clickStyleHandler(Number(e.target.id))
    // reset size and qty dropdowns
    this.setState({
      selectedSku: null,
      selectedQty: null
    })
  }

  sortSkus(style) {
    let skus = Object.keys(style.skus);
    skus.sort((a, b) => { // only sort numbers
      if (Number(a)) { return a-b }
    })
    return skus;
  }
  
  handleOutsideDropdown(e) { 
    if (this.popupNode && this.popupNode.contains(e.target)) {
      return; // ignore clicks on popups
    }
    this.toggleSelector();
  }

  toggleSelector(e) {
    // if state.activeDropdown is defined
    if (this.state.activeDropdown) {
      // set state.activeSelector to null and remove eventListener
      this.setState({ activeDropdown: null })
      document.removeEventListener('click', this.handleOutsideDropdown)
     }
     // if state.activeDropdown isn't set
     else {
      this.setState({
        activeDropdown: e.target.id
      })
      // add an event Listener to document
      document.addEventListener('click', this.handleOutsideDropdown)
     }
  }

  selectSize(e) {
    let selectedSku = e.target.id;
    // update state with selected size
    this.setState({ selectedSku: selectedSku}, () => {
      // update state with an array of possible quantity selections
      let qtyAvailable = this.props.selectedStyle.skus[selectedSku]
      let qtyOptions = [];
      for (let i = 1; i <= qtyAvailable; i++) {
        if (i > 15) { break; } // show a max of 15 available
        qtyOptions.push(i);
      }
      this.setState({ 
        qtyOptions: qtyOptions,
        selectedQty: 1 // default is 1
      })
    })
  }

  selectQty(e) {
    let selectedQty = e.target.id;
    this.setState({ selectedQty: selectedQty }, () => {
    });
  }

  closePopup(e) {
    this.setState({ addedToCart: null })
    document.removeEventListener('click', this.closePopup)
  }

  addToCart(e) {
    // if no size selected
    if (!this.state.selectedSku) {
      //pop-up prompting user to select size
      this.setState({ addedToCart: 'Please select a size' }, () => {
        // expand size selector
        document.getElementById('sku').click()
        document.addEventListener('click', this.closePopup)
      })
      return;
    }
    // post to cart
    axios.post('http://52.26.193.201:3000/cart', {
      user_token: this.props.sessionId,
      sku_id: this.state.selectedSku
    })
    .then(response => {
      // pop-up 'added to cart'
      this.setState({ addedToCart: 'Successfully added item to cart' }, () => {
        document.addEventListener('click', this.closePopup)
      })
    })
    .catch( error => {
      // pop-up 'error adding to cart'
      this.setState({ addedToCart: 'Error adding item to cart' }, () => {
        document.addEventListener('click', this.closePopup)
      })
    })
    // reset dropdown menus
    this.setState({
      selectedSku: null,
      selectedQty: null
    })
  }

  
  render() {
    return(
      <div className="row" data-selector="style-selector">
        {/* // Style Selector */}
          <div className="col-sm-12">
              {this.props.selectedStyle.sale_price !== '0' ? 
                <p><span className="sale-price mr-2">${this.props.selectedStyle.sale_price}</span><span className="strikethrough">${this.props.selectedStyle.original_price}</span></p> :
                <p><span>${this.props.selectedStyle.original_price}</span></p>
              }
            <p>{this.props.selectedStyle.name}</p>
            <div className="row no-gutters mt-4">
            {
            this.props.styles.map((style, i) => {
              return (
                <div key={i} className="col-3" data-selector={"style-selector-thumbnail-" + i}>
                  <div className="style-tb-div d-flex justify-content-center align-items-center">
                  {style.style_id===this.props.selectedStyle.style_id ? <i className="material-icons checkmark icon-bg"> check_circle </i> : null}
                  <img alt={`${style.name}`} id={style.style_id} onClick={this.styleClick} src={style.photos[0].thumbnail_url} className="style-tb"></img>
                  </div>
                </div>)
            })
            }
            </div>
          </div>

          
          <div className="col-sm-12 mt-1 mb-4 d-flex justify-content-center">
            {/* size selector */}      
            <div className="col-sm-6 checkout-item selector" data-selector="select-size">
              <div className="row no-gutters">
              <div className="col-sm-12">
                <div id="sku" onClick={this.toggleSelector} className="selector-main justify-content-center align-items-center">
                  {/* set default value based on whether or not style is in stock */}
                  {Object.keys(this.props.selectedStyle.skus).length === 0 ?
                  <span className="disabled ml-2 mr-2">Out of Stock</span> :
                  <span className="ml-2 mr-2">{this.state.selectedSku ? "size " + this.state.selectedSku : "Select Size" }</span>
                  }
                </div>      
                  {/* toggle dropdown when user clicks on it, selects a size, or clicks off of it */}
                  { this.state.activeDropdown === 'sku' ? 
                    <div className="options">
                        { this.sortSkus(this.props.selectedStyle).map((sku, i) => {
                        return (
                          <div key={i} onClick={this.selectSize} id={sku} className="item d-flex justify-content-center">
                            {sku}
                          </div>
                        )
                      })}
                    </div> : null
                  }                
              </div>
              </div>
            </div>

            {/* quantity selector */}
            <div className="col-sm-6 checkout-item selector d-flex align-items-center justify-content-center" data-selector="select-quantity">
            <div className="row no-gutters">
              <div className="col-8">
                <div className="pr-2">Quantity:</div> 
                <div id="qty" onClick={this.state.selectedSku ? this.toggleSelector : null} className="selector-main d-flex align-items-center justify-content-center">
                  {/* set default value based on whether or not size has been selected */}
                  <span className="ml-2 mr-2">{ this.state.selectedQty ? this.state.selectedQty : '-' }</span> 
                </div>
                { this.state.activeDropdown === 'qty' ?
                    <div id="qtySelector" className="options">
                      {this.state.qtyOptions.map((qty, i) => {
                        return (
                          <div key={i} onClick={this.selectQty} id={qty} className="item d-flex align-items-center justify-content-center">
                            {qty}
                          </div>
                        )
                      })}
                    </div> 
                  : null
                }
             
              </div>
              </div>
            </div>
          </div> 
          {/* Add To Cart */}
          <div className="col-sm-12 mb-3 d-flex align-items-center justify-content-center" data-selector="add-to-cart">
            {/* hide cart button when style is out of stock */}
            {Object.keys(this.props.selectedStyle.skus).length === 0 ? null :
              <button className="block-button" onClick={this.addToCart}>Add to cart</button>
            }
            
          </div>
          { !this.state.addedToCart ? null :
            <div ref={node => {this.popupNode = node}} >
            <div className="overview-popup popup">
                  <div className="popup-body d-flex align-items-center justify-content-center">
                    {this.state.addedToCart}
                  </div>
            </div>
            </div>
          }
      </div>
    )
  }
}

export default StyleSelector;