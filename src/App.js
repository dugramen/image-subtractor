import './App.css';
import React from 'react';

function App() {
  const [images, setImages] = React.useState(
    [1,2].reduce((p, c) => ({
      ...p,
      [c]: {
        ref: React.createRef(),
        img: undefined
      }
    }), {})
  )
  const [imagesCollapsed, setImagesCollapsed] = React.useState(false)
  const [canExport, setCanExport] = React.useState(false)
  const [options, setOptions] = React.useState({
    flexibility: 0,
    checkered: false,
    extractDifferences: true,
  })
  const [dataURL, setDataURL] = React.useState(true)
  const updateCount = React.useRef(0)
  const finalRef = React.useRef(null)

  React.useEffect(() => {
    if (finalRef.current && Object.values(images).every(val => val.img !== undefined)) {
      // handleSubtraction()
      updateCount.current += 1
      function process() {
        if (updateCount.current > 1) {
          return
        }
        requestIdleCallback(() => {
          handleSubtraction()
          if (updateCount.current > 1) {
            process()
          }
          updateCount.current = 0
        })
      }
      process()
    }
  }, [options.flexibility, options.extractDifferences])

  function handleSubtraction() {
    setCanExport(true)
    const {height, width} = images[1].ref.current
    const getImageData = n => images[n].ref.current.getContext('2d').getImageData(0, 0, width, height)
    const comparisonData = getImageData(1).data
    const imageData = new ImageData(getImageData(2).data, width)
    const data = imageData.data

    for (let i = 0; i < data.length; i+=4) {
      const slice = data.slice(i, i + 4)
      let reducer = (accum, val, j) => accum + Math.abs(val - comparisonData[i+j])
      if ((slice.reduce(reducer, 0) <= options.flexibility) === options.extractDifferences) { // Both true or both false
        data[i + 3] = 0
      }
    }
    finalRef.current.width = width
    finalRef.current.height = height

    const fctx = finalRef.current.getContext('2d')
    fctx.putImageData(imageData, 0, 0)
    setDataURL(finalRef.current.toDataURL("image/png"))
  }

  function updateOptions(key, value) {
    setOptions(old => ({
      ...old,
      [key]: value
    }))
  }

  const flexibilityProps = {
    min: -1,
    max: 510,
    value: options.flexibility,
    name: "flexibility",
    onChange: e => updateOptions("flexibility", e.target.value),
  }

  return (
    <div className="App">
      <div className={`images-container ${imagesCollapsed? "collapsed": "expanded"}`}>
        {[1, 2].map(id => (
          <div className='image-container'>
            <canvas
              width={0}
              height={0}
              ref={images[id].ref}
            />
            <div className='image-loader'>
              <input
                className='image-upload'
                type={'file'}
                accept={'image/*'}
                onChange={event => {
                  const canvas = images[id].ref.current;
                  const reader = new FileReader();
                  
                  const img = new Image();
                  img.onload = function() {
                    canvas.width = img.width
                    canvas.height = img.height
                    canvas.getContext('2d').drawImage(img, 0, 0)
                  }
                  reader.onload = (e) => {
                    img.src = e.target.result;
                  }
                  // console.log(event.target.files[0])
                  reader.readAsDataURL(event.target.files[0])
                  
                  setImages(oldImages => ({
                    ...oldImages,
                    [id]: {
                      ...oldImages[id],
                      img: img
                    }
                  }))
                }}
              />
              <input
                className='url'
                type={'url'}
                placeholder='or paste URL'
                onChange = {event => {
                  const canvas = images[id].ref.current;
                  const img = new Image();
                  img.onload = function() {
                    canvas.width = img.width
                    canvas.height = img.height
                    canvas.getContext('2d').drawImage(img, 0, 0)
                  }
                  img.src = event.target.value
                  img.crossOrigin = "Anonymous";

                  setImages(oldImages => ({
                    ...oldImages,
                    [id]: {
                      ...oldImages[id],
                      img: img
                    }
                  }))
                }}
              />
            </div>
          </div>
          ))
        }
      </div>

      <div className='button-holders'>
        <button
          className='generate-button'
          disabled={Object.values(images).some(image => image.img === undefined)}
          onClick={() => handleSubtraction()}
        > Subtract Images 
        </button>
        <button
          onClick={() => setImagesCollapsed(old => !old)}
        >{imagesCollapsed? "Expand": "Collapse"}</button>
      </div>

      
      <canvas
        className={`final-canvas ${options.checkered && "checkered"}`}
        width={0}
        height={0}
        ref={finalRef}
      />

      <div>
        <input
          type={'range'}
          {...flexibilityProps}
        />
        <input
          type={'number'}
          {...flexibilityProps}
        />
      </div>

      <div>
        Extract pixels that are:
        <label>
          <input
            type={'radio'}
            name='type'
            checked={options.extractDifferences}
            onChange={e => setOptions(old => ({
              ...old,
              extractDifferences: e.target.checked
            }))}
          />
          Different
        </label>
        
        <label>
          <input
            type={'radio'}
            name='type'
            checked={!options.extractDifferences}
            onChange={e => setOptions(old => ({
              ...old,
              extractDifferences: !e.target.checked
            }))}
          />
          Similar
        </label>
      </div>
      
      <a
        href={canExport? dataURL: 'false'}
        download
      >
        <button>
          Download
        </button>
      </a>
        
    </div>
  );
}

export default App;
