import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  noPadding = false,
  ...props
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`} {...props}>
      {(title || subtitle) && (
        <div className={`border-b border-gray-200 ${headerClassName} ${!noPadding ? 'px-4 py-5 sm:px-6' : ''}`}>
          {title && <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      
      <div className={`${bodyClassName} ${!noPadding ? 'px-4 py-5 sm:p-6' : ''}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`border-t border-gray-200 ${footerClassName} ${!noPadding ? 'px-4 py-4 sm:px-6' : ''}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;