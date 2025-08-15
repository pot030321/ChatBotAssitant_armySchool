import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// FAQ data
const faqData = [
  {
    id: 1,
    question: 'Làm thế nào để đăng ký môn học?',
    answer: 'Bạn có thể đăng ký các môn học thông qua cổng thông tin sinh viên. Đăng nhập vào tài khoản của bạn, chọn mục "Đăng ký học phần", sau đó chọn các môn học mà bạn muốn đăng ký. Thời gian đăng ký thường bắt đầu 2 tuần trước khi kết thúc học kỳ hiện tại.',
    category: 'registration'
  },
  {
    id: 2,
    question: 'Làm thế nào để xem lịch học của tôi?',
    answer: 'Bạn có thể xem lịch học của mình trong cổng thông tin sinh viên, mục "Lịch học". Lịch học sẽ được cập nhật sau khi bạn đăng ký môn học thành công và được phê duyệt.',
    category: 'academic'
  },
  {
    id: 3,
    question: 'Làm thế nào để xin nghỉ học?',
    answer: 'Để xin nghỉ học, bạn cần gửi đơn xin phép cho giảng viên môn học và trưởng khoa. Bạn có thể tải mẫu đơn tại website của trường hoặc liên hệ văn phòng khoa. Đơn cần được nộp trước ngày nghỉ học ít nhất 3 ngày làm việc.',
    category: 'academic'
  },
  {
    id: 4,
    question: 'Khi nào tôi nhận được bằng tốt nghiệp?',
    answer: 'Sau khi hoàn thành tất cả các môn học và đủ điều kiện tốt nghiệp, bạn cần nộp đơn xin cấp bằng tại văn phòng đào tạo. Thời gian cấp bằng thường mất khoảng 1-2 tháng sau khi xét duyệt hồ sơ tốt nghiệp.',
    category: 'graduation'
  },
  {
    id: 5,
    question: 'Làm thế nào để thanh toán học phí?',
    answer: 'Bạn có thể thanh toán học phí bằng nhiều cách: chuyển khoản ngân hàng, thanh toán trực tiếp tại phòng tài chính của trường, hoặc thanh toán online thông qua cổng thông tin sinh viên. Hạn thanh toán học phí thường là 2 tuần sau khi bắt đầu học kỳ.',
    category: 'finance'
  },
  {
    id: 6,
    question: 'Làm thế nào để đăng ký ở ký túc xá?',
    answer: 'Để đăng ký ở ký túc xá, bạn cần điền đơn đăng ký trên cổng thông tin sinh viên, mục "Ký túc xá". Việc phân phòng sẽ được thực hiện dựa trên thứ tự ưu tiên và thời gian đăng ký. Bạn sẽ nhận được thông báo qua email khi đơn đăng ký được phê duyệt.',
    category: 'housing'
  },
  {
    id: 7,
    question: 'Làm thế nào để gia hạn thời gian mượn sách thư viện?',
    answer: 'Bạn có thể gia hạn thời gian mượn sách thông qua website của thư viện hoặc đến trực tiếp quầy thư viện. Việc gia hạn cần được thực hiện trước ngày hết hạn, và bạn chỉ có thể gia hạn tối đa 2 lần cho mỗi cuốn sách.',
    category: 'library'
  },
  {
    id: 8,
    question: 'Tôi có thể xin học bổng như thế nào?',
    answer: 'Thông tin về các loại học bổng và cách đăng ký được đăng tại website của trường và cổng thông tin sinh viên. Bạn cần đáp ứng các yêu cầu về điểm trung bình, hoạt động ngoại khóa, và nộp đơn đúng thời hạn để được xét duyệt học bổng.',
    category: 'finance'
  },
  {
    id: 9,
    question: 'Làm thế nào để đăng ký thực tập?',
    answer: 'Quy trình đăng ký thực tập thường được quản lý bởi khoa của bạn. Bạn cần liên hệ với văn phòng khoa hoặc giáo viên phụ trách để biết thông tin chi tiết về cách đăng ký, các công ty đối tác, và các yêu cầu cụ thể của chương trình thực tập.',
    category: 'academic'
  },
  {
    id: 10,
    question: 'Tôi có thể liên hệ hỗ trợ kỹ thuật ở đâu?',
    answer: 'Đối với các vấn đề kỹ thuật liên quan đến hệ thống thông tin, bạn có thể liên hệ phòng công nghệ thông tin của trường qua email support@school.edu hoặc số điện thoại 0123-456-789. Giờ làm việc từ 8:00 đến 17:00, từ thứ Hai đến thứ Sáu.',
    category: 'technical'
  }
];

// FAQ categories
const categories = [
  { id: 'all', name: 'Tất cả câu hỏi' },
  { id: 'registration', name: 'Đăng ký học phần' },
  { id: 'academic', name: 'Học tập' },
  { id: 'graduation', name: 'Tốt nghiệp' },
  { id: 'finance', name: 'Tài chính' },
  { id: 'housing', name: 'Ký túc xá' },
  { id: 'library', name: 'Thư viện' },
  { id: 'technical', name: 'Hỗ trợ kỹ thuật' }
];

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState([]);
  const navigate = useNavigate();

  // Toggle FAQ item expansion
  const toggleExpand = (id) => {
    if (expandedItems.includes(id)) {
      setExpandedItems(expandedItems.filter(item => item !== id));
    } else {
      setExpandedItems([...expandedItems, id]);
    }
  };

  // Filter FAQs based on category and search query
  const filteredFAQs = faqData.filter(faq => {
    // Filter by category
    if (activeCategory !== 'all' && faq.category !== activeCategory) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return faq.question.toLowerCase().includes(query) || 
             faq.answer.toLowerCase().includes(query);
    }
    
    return true;
  });

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">Cổng Hỗ Trợ</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item" onClick={() => navigate('/student')}>Bảng điều khiển</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/my-questions')}>Câu hỏi của tôi</li>
          <li className="sidebar-menu-item active">Câu hỏi thường gặp</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Câu hỏi thường gặp</h1>
        </div>
        
        <div className="card mb-3">
          <div className="card-header">
            <h2 className="card-title">Tìm kiếm câu hỏi</h2>
          </div>
          <div className="faq-search">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm câu hỏi hoặc câu trả lời..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="faq-container">
          <div className="faq-sidebar">
            <h3>Danh mục</h3>
            <ul className="category-list">
              {categories.map(category => (
                <li 
                  key={category.id}
                  className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="faq-content">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  {categories.find(cat => cat.id === activeCategory)?.name || 'Tất cả câu hỏi'}
                </h2>
                <span className="faq-count">{filteredFAQs.length} câu hỏi</span>
              </div>
              
              {filteredFAQs.length > 0 ? (
                <ul className="faq-list">
                  {filteredFAQs.map(faq => (
                    <li key={faq.id} className="faq-item">
                      <div 
                        className={`faq-question ${expandedItems.includes(faq.id) ? 'expanded' : ''}`}
                        onClick={() => toggleExpand(faq.id)}
                      >
                        <span>{faq.question}</span>
                        <span className="faq-toggle">
                          {expandedItems.includes(faq.id) ? '−' : '+'}
                        </span>
                      </div>
                      {expandedItems.includes(faq.id) && (
                        <div className="faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center p-4">
                  Không tìm thấy câu hỏi nào phù hợp với tiêu chí của bạn.
                </div>
              )}
            </div>
            
            <div className="card mt-3">
              <div className="card-header">
                <h2 className="card-title">Không tìm thấy câu trả lời?</h2>
              </div>
              <div className="not-found-help">
                <p>Nếu bạn không tìm thấy câu trả lời cho câu hỏi của mình, bạn có thể:</p>
                <div className="help-options">
                  <button 
                    className="btn"
                    onClick={() => navigate('/student')}
                  >
                    Hỏi trợ lý ảo
                  </button>
                  <button 
                    className="btn btn-secondary ms-2"
                    onClick={() => navigate('/student')}
                  >
                    Tạo câu hỏi mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
